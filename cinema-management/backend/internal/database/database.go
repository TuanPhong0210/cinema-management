package database

import (
	"fmt"
	"time"

	"cinema-management/backend/internal/config"
	"cinema-management/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&domain.Manager{}, &domain.Movie{}, &domain.Room{}, &domain.Seat{},
		&domain.Showtime{}, &domain.ShowtimeSeat{}, &domain.Ticket{}, &domain.TicketSeat{},
		&domain.Employee{}, &domain.Attendance{},
	)
}

func Seed(db *gorm.DB) error {
	var managers int64
	db.Model(&domain.Manager{}).Count(&managers)
	if managers == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		db.Create(&domain.Manager{Name: "Cinema Admin", Email: "admin@cinema.com", PasswordHash: string(hash)})
	}

	var movies int64
	db.Model(&domain.Movie{}).Count(&movies)
	if movies == 0 {
		db.Create(&[]domain.Movie{
			{Title: "Midnight Orbit", Description: "A rescue crew crosses a silent galaxy to save a stranded colony.", Genre: "Sci-Fi", DurationMinutes: 128, PosterURL: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80", Status: "now showing"},
			{Title: "The Violet Case", Description: "A detective follows a trail through the city cinema district.", Genre: "Thriller", DurationMinutes: 112, PosterURL: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80", Status: "now showing"},
			{Title: "Summer Encore", Description: "A musician returns home and finds a second chance.", Genre: "Drama", DurationMinutes: 104, PosterURL: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80", Status: "coming soon"},
		})
	}

	var rooms int64
	db.Model(&domain.Room{}).Count(&rooms)
	if rooms == 0 {
		for _, room := range []domain.Room{{Name: "Room A", Rows: 5, SeatsPerRow: 8, ScreenType: "2D"}, {Name: "Room IMAX", Rows: 6, SeatsPerRow: 10, ScreenType: "IMAX"}} {
			createRoomWithSeats(db, &room)
		}
	}

	var showtimes int64
	db.Model(&domain.Showtime{}).Count(&showtimes)
	if showtimes == 0 {
		var movie domain.Movie
		var room domain.Room
		db.Where("status = ?", "now showing").First(&movie)
		db.First(&room)
		for i, start := range []string{"14:00", "19:30"} {
			st := domain.Showtime{MovieID: movie.ID, RoomID: room.ID, ShowDate: time.Now().AddDate(0, 0, i).Format("2006-01-02"), StartTime: start, EndTime: "21:45", TicketPrice: 95000}
			createShowtimeWithSeats(db, &st)
		}
	}

	var employees int64
	db.Model(&domain.Employee{}).Count(&employees)
	if employees == 0 {
		db.Create(&[]domain.Employee{
			{FullName: "Linh Tran", Email: "linh@cinema.com", Phone: "0901000001", Role: "Cashier", IsOnShift: true},
			{FullName: "Minh Nguyen", Email: "minh@cinema.com", Phone: "0901000002", Role: "Usher", IsOnShift: false},
		})
	}
	return nil
}

func createRoomWithSeats(db *gorm.DB, room *domain.Room) {
	db.Create(room)
	for r := 0; r < room.Rows; r++ {
		row := string(rune('A' + r))
		for n := 1; n <= room.SeatsPerRow; n++ {
			db.Create(&domain.Seat{RoomID: room.ID, RowLabel: row, SeatNumber: n, SeatCode: fmt.Sprintf("%s%d", row, n)})
		}
	}
}

func createShowtimeWithSeats(db *gorm.DB, showtime *domain.Showtime) {
	db.Create(showtime)
	var seats []domain.Seat
	db.Where("room_id = ?", showtime.RoomID).Find(&seats)
	for _, seat := range seats {
		db.Create(&domain.ShowtimeSeat{ShowtimeID: showtime.ID, SeatID: seat.ID, Status: "available"})
	}
}
