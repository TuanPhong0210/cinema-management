package usecase

import (
	"errors"
	"time"

	"cinema-management/backend/internal/domain"
	"cinema-management/backend/internal/repository"
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

func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
