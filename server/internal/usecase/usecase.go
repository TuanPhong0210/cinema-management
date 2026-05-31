package usecase

import (
	"errors"
	"time"

	"cinema-management/server/internal/domain"
	"cinema-management/server/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Usecase struct {
	Repo      *repository.Repository
	JWTSecret string
}

func New(repo *repository.Repository, secret string) *Usecase {
	return &Usecase{Repo: repo, JWTSecret: secret}
}

func (u *Usecase) Login(email, password string) (string, *domain.Manager, error) {
	var manager domain.Manager
	if err := u.Repo.DB.Where("email = ?", email).First(&manager).Error; err != nil {
		return "", nil, errors.New("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(manager.PasswordHash), []byte(password)) != nil {
		return "", nil, errors.New("invalid credentials")
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"manager_id": manager.ID,
		"email":      manager.Email,
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte(u.JWTSecret))
	return signed, &manager, err
}

func (u *Usecase) RequireManager(tokenString string) error {
	if tokenString == "" {
		return errors.New("missing token")
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token")
		}
		return []byte(u.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return errors.New("unauthorized")
	}
	return nil
}

func (u *Usecase) Dashboard() (map[string]interface{}, error) {
	db := u.Repo.DB
	var movieCount, showtimeCount, ticketCount, onShift int64
	db.Model(&domain.Movie{}).Count(&movieCount)
	db.Model(&domain.Showtime{}).Count(&showtimeCount)
	db.Model(&domain.Ticket{}).Where("status IN ?", []string{"booked", "paid"}).Count(&ticketCount)
	db.Model(&domain.Employee{}).Where("is_on_shift = ?", true).Count(&onShift)
	var revenue float64
	db.Model(&domain.Ticket{}).Where("status IN ?", []string{"booked", "paid"}).Select("COALESCE(SUM(total_price),0)").Scan(&revenue)
	return map[string]interface{}{"totalMovies": int(movieCount), "totalShowtimes": int(showtimeCount), "totalTicketsSold": int(ticketCount), "employeesOnShift": int(onShift), "revenue": revenue}, nil
}

func (u *Usecase) DeleteByID(model interface{}, id uint) error {
	return u.Repo.DB.Delete(model, id).Error
}

func (u *Usecase) ParseTokenUserID(tokenString string) (uint, error) {
	if tokenString == "" {
		return 0, errors.New("missing token")
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token")
		}
		return []byte(u.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return 0, errors.New("unauthorized")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}
	rawUID, ok := claims["user_id"]
	if !ok {
		return 0, errors.New("user_id not found in token")
	}
	switch v := rawUID.(type) {
	case float64:
		return uint(v), nil
	case int64:
		return uint(v), nil
	default:
		return 0, errors.New("invalid user_id format")
	}
}

func (u *Usecase) ClientRegister(fullName, email, password, phone string) (interface{}, error) {
	var count int64
	u.Repo.DB.Model(&domain.User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		return nil, errors.New("email already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := domain.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: string(hash),
		Phone:        phone,
		Role:         "Thành viên V.I.P",
	}

	if err := u.Repo.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte(u.JWTSecret))
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{"token": signed, "user": user}, nil
}

func (u *Usecase) ClientLogin(email, password string) (interface{}, error) {
	var user domain.User
	if err := u.Repo.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return nil, errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte(u.JWTSecret))
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{"token": signed, "user": user}, nil
}

func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
