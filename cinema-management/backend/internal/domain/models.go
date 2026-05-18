package domain

import "time"

type Manager struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	Email        string    `gorm:"uniqueIndex" json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Movie struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Genre           string    `json:"genre"`
	DurationMinutes int       `json:"durationMinutes"`
	PosterURL       string    `json:"posterUrl"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type Room struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Rows        int       `json:"rows"`
	SeatsPerRow int       `json:"seatsPerRow"`
	ScreenType  string    `json:"screenType"`
	Seats       []Seat    `json:"seats"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Seat struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	RoomID     uint      `json:"roomId"`
	RowLabel   string    `json:"rowLabel"`
	SeatNumber int       `json:"seatNumber"`
	SeatCode   string    `json:"seatCode"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Showtime struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	MovieID     uint      `json:"movieId"`
	RoomID      uint      `json:"roomId"`
	Movie       Movie     `json:"movie"`
	Room        Room      `json:"room"`
	ShowDate    string    `json:"showDate"`
	StartTime   string    `json:"startTime"`
	EndTime     string    `json:"endTime"`
	TicketPrice float64   `json:"ticketPrice"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ShowtimeSeat struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ShowtimeID uint      `json:"showtimeId"`
	SeatID     uint      `json:"seatId"`
	Seat       Seat      `json:"seat"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Ticket struct {
	ID           uint         `gorm:"primaryKey" json:"id"`
	ShowtimeID   uint         `json:"showtimeId"`
	Showtime     Showtime     `json:"showtime"`
	CustomerName *string      `json:"customerName"`
	TotalPrice   float64      `json:"totalPrice"`
	Status       string       `json:"status"`
	Seats        []TicketSeat `json:"seats"`
	CreatedAt    time.Time    `json:"createdAt"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type TicketSeat struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	TicketID       uint      `json:"ticketId"`
	ShowtimeSeatID uint      `json:"showtimeSeatId"`
	SeatCode       string    `json:"seatCode"`
	Price          float64   `json:"price"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Employee struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	FullName  string    `json:"fullName"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role"`
	IsOnShift bool      `json:"isOnShift"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Attendance struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	EmployeeID   uint       `json:"employeeId"`
	Employee     Employee   `json:"employee"`
	ClockInTime  time.Time  `json:"clockInTime"`
	ClockOutTime *time.Time `json:"clockOutTime"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}
