package repository

import (
	"errors"
	"fmt"
	"time"

	"cinema-management/server/internal/domain"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func New(db *gorm.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) CreateRoom(room *domain.Room) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(room).Error; err != nil {
			return err
		}
		for i := 0; i < room.Rows; i++ {
			row := string(rune('A' + i))
			for n := 1; n <= room.SeatsPerRow; n++ {
				if err := tx.Create(&domain.Seat{RoomID: room.ID, RowLabel: row, SeatNumber: n, SeatCode: fmt.Sprintf("%s%d", row, n)}).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *Repository) UpdateRoom(room *domain.Room) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(room).Error; err != nil {
			return err
		}
		tx.Where("room_id = ?", room.ID).Delete(&domain.Seat{})
		for i := 0; i < room.Rows; i++ {
			row := string(rune('A' + i))
			for n := 1; n <= room.SeatsPerRow; n++ {
				tx.Create(&domain.Seat{RoomID: room.ID, RowLabel: row, SeatNumber: n, SeatCode: fmt.Sprintf("%s%d", row, n)})
			}
		}
		return nil
	})
}

func (r *Repository) CreateShowtime(showtime *domain.Showtime) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(showtime).Error; err != nil {
			return err
		}
		var seats []domain.Seat
		if err := tx.Where("room_id = ?", showtime.RoomID).Find(&seats).Error; err != nil {
			return err
		}
		for _, seat := range seats {
			if err := tx.Create(&domain.ShowtimeSeat{ShowtimeID: showtime.ID, SeatID: seat.ID, Status: "available"}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) BookTickets(showtimeID uint, seatIDs []uint, customerName *string, userID *uint) (*domain.Ticket, error) {
	var showtime domain.Showtime
	if err := r.DB.First(&showtime, showtimeID).Error; err != nil {
		return nil, err
	}

	var ticket domain.Ticket
	err := r.DB.Transaction(func(tx *gorm.DB) error {
		var selected []domain.ShowtimeSeat
		if err := tx.Preload("Seat").Where("showtime_id = ? AND id IN ?", showtimeID, seatIDs).Find(&selected).Error; err != nil {
			return err
		}
		if len(selected) != len(seatIDs) {
			return errors.New("one or more seats do not exist")
		}
		for _, seat := range selected {
			if seat.Status != "available" {
				return fmt.Errorf("seat %s is already booked", seat.Seat.SeatCode)
			}
		}
		ticket = domain.Ticket{ShowtimeID: showtimeID, UserID: userID, CustomerName: customerName, TotalPrice: float64(len(selected)) * showtime.TicketPrice, Status: "booked"}
		if err := tx.Create(&ticket).Error; err != nil {
			return err
		}
		for _, seat := range selected {
			if err := tx.Model(&domain.ShowtimeSeat{}).Where("id = ?", seat.ID).Update("status", "booked").Error; err != nil {
				return err
			}
			if err := tx.Create(&domain.TicketSeat{TicketID: ticket.ID, ShowtimeSeatID: seat.ID, SeatCode: seat.Seat.SeatCode, Price: showtime.TicketPrice}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	r.DB.Preload("Seats").Preload("Showtime.Movie").Preload("Showtime.Room").First(&ticket, ticket.ID)
	return &ticket, nil
}

func (r *Repository) ClockIn(employeeID uint) (*domain.Attendance, error) {
	now := time.Now()
	attendance := domain.Attendance{EmployeeID: employeeID, ClockInTime: now}
	err := r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&domain.Employee{}).Where("id = ?", employeeID).Update("is_on_shift", true).Error; err != nil {
			return err
		}
		return tx.Create(&attendance).Error
	})
	return &attendance, err
}

func (r *Repository) ClockOut(employeeID uint) (*domain.Attendance, error) {
	var attendance domain.Attendance
	now := time.Now()
	err := r.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("employee_id = ? AND clock_out_time IS NULL", employeeID).Order("clock_in_time DESC").First(&attendance).Error; err != nil {
			return err
		}
		if err := tx.Model(&attendance).Update("clock_out_time", now).Error; err != nil {
			return err
		}
		return tx.Model(&domain.Employee{}).Where("id = ?", employeeID).Update("is_on_shift", false).Error
	})
	attendance.ClockOutTime = &now
	return &attendance, err
}
