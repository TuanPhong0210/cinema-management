package database

import (
	"fmt"
	"time"

	"cinema-management/server/internal/config"
	"cinema-management/server/internal/domain"
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
		&domain.Manager{}, &domain.User{}, &domain.Movie{}, &domain.Room{}, &domain.Seat{},
		&domain.Showtime{}, &domain.ShowtimeSeat{}, &domain.Ticket{}, &domain.TicketSeat{},
		&domain.Employee{}, &domain.Attendance{},
	)
}

func calculateEndTime(start string, duration int) string {
	var h, m int
	_, _ = fmt.Sscanf(start, "%d:%d", &h, &m)
	totalMinutes := h*60 + m + duration
	endH := (totalMinutes / 60) % 24
	endM := totalMinutes % 60
	return fmt.Sprintf("%02d:%02d", endH, endM)
}

func Seed(db *gorm.DB) error {
	var managers int64
	db.Model(&domain.Manager{}).Count(&managers)
	if managers == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		db.Create(&domain.Manager{Name: "Cinema Admin", Email: "admin@cinema.com", PasswordHash: string(hash)})
	}

	var users int64
	db.Model(&domain.User{}).Count(&users)
	if users == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		db.Create(&domain.User{
			FullName:     "Nguyễn Văn A",
			Email:        "vana.nguyen@email.com",
			PasswordHash: string(hash),
			Phone:        "090 123 4567",
			Role:         "Thành viên V.I.P",
		})
	}

	var oldMovie domain.Movie
	db.Where("title = ?", "Midnight Orbit").First(&oldMovie)
	if oldMovie.ID > 0 {
		// Clear movies, showtimes, seats, tickets, etc. to prevent foreign key issues and ensure a fresh clean database!
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.TicketSeat{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.Ticket{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.ShowtimeSeat{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.Showtime{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.Seat{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.Room{})
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&domain.Movie{})
	}

	var movies int64
	db.Model(&domain.Movie{}).Count(&movies)
	if movies == 0 {
		moviesList := []domain.Movie{
			{Title: "Iron Man", Description: "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.", Genre: "Action", DurationMinutes: 126, PosterURL: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Thor", Description: "The powerful but arrogant god Thor is cast out of Asgard to live amongst humans in Midgard (Earth), where he soon becomes one of their finest defenders.", Genre: "Fantasy", DurationMinutes: 115, PosterURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Captain America: The First Avenger", Description: "Steve Rogers, a rejected military soldier, transforms into Captain America after taking a dose of a Super-Soldier serum to battle the war-mongering Hydra.", Genre: "Sci-Fi", DurationMinutes: 124, PosterURL: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "The Avengers", Description: "Earth's mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.", Genre: "Action", DurationMinutes: 143, PosterURL: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Iron Man 2", Description: "With the world now aware of his identity as Iron Man, Tony Stark must contend with both his declining health and a vengeful madman with ties to his father's past.", Genre: "Action", DurationMinutes: 124, PosterURL: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Thor: The Dark World", Description: "When the Dark Elves attempt to plunge the universe into darkness, Thor must embark on a perilous personal journey that will reunite him with Jane Foster.", Genre: "Fantasy", DurationMinutes: 112, PosterURL: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Captain America: The Winter Soldier", Description: "As Steve Rogers struggles to embrace his role in the modern world, he teams up with a fellow Avenger, the Black Widow, to battle a powerful yet shadowy enemy.", Genre: "Action", DurationMinutes: 136, PosterURL: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Guardians of the Galaxy", Description: "A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.", Genre: "Sci-Fi", DurationMinutes: 121, PosterURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Avengers: Age of Ultron", Description: "When Tony Stark and Bruce Banner try to jumpstart a dormant peacekeeping program called Ultron, things go wrong and the Avengers must reassemble.", Genre: "Action", DurationMinutes: 141, PosterURL: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Ant-Man", Description: "Armed with a super-suit with the astonishing ability to shrink in scale but increase in strength, cat burglar Scott Lang must embrace his inner hero.", Genre: "Sci-Fi", DurationMinutes: 117, PosterURL: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Captain America: Civil War", Description: "Political interference in the Avengers' activities causes a rift between former allies Captain America and Iron Man.", Genre: "Action", DurationMinutes: 147, PosterURL: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Doctor Strange", Description: "While on a journey of physical and spiritual healing, a brilliant neurosurgeon is drawn into the world of the mystic arts.", Genre: "Fantasy", DurationMinutes: 115, PosterURL: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Guardians of the Galaxy Vol. 2", Description: "The Guardians struggle to keep their newfound family together as they help Peter Quill learn more about his true parentage.", Genre: "Sci-Fi", DurationMinutes: 136, PosterURL: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Spider-Man: Homecoming", Description: "Peter Parker balances his life as an ordinary high school student in Queens with his superhero alter-ego Spider-Man, and finds himself on the trail of a new menace.", Genre: "Action", DurationMinutes: 133, PosterURL: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Thor: Ragnarok", Description: "Imprisoned on the planet Sakaar, Thor must race against time to return to Asgard and stop Ragnarok, the destruction of his world, at the hands of the ruthless Hela.", Genre: "Sci-Fi", DurationMinutes: 130, PosterURL: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Black Panther", Description: "T'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new era and confront a challenger from his country's past.", Genre: "Action", DurationMinutes: 134, PosterURL: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Avengers: Infinity War", Description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.", Genre: "Action", DurationMinutes: 149, PosterURL: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80", Status: "now showing"},
			{Title: "Ant-Man and the Wasp", Description: "As Scott Lang balances being both a superhero and a father, Hope van Dyne and Dr. Hank Pym present an urgent new mission that finds him fighting alongside the Wasp.", Genre: "Sci-Fi", DurationMinutes: 118, PosterURL: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=600&q=80", Status: "coming soon"},
			{Title: "Captain Marvel", Description: "Carol Danvers becomes one of the universe's most powerful heroes when Earth is caught in the middle of a galactic war between two alien races.", Genre: "Sci-Fi", DurationMinutes: 124, PosterURL: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=600&q=80", Status: "coming soon"},
			{Title: "Avengers: Endgame", Description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions.", Genre: "Action", DurationMinutes: 181, PosterURL: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80", Status: "coming soon"},
			{Title: "Spider-Man: Far From Home", Description: "Following the events of Avengers: Endgame, Spider-Man must step up to take on new threats in a world that has changed forever.", Genre: "Action", DurationMinutes: 129, PosterURL: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80", Status: "coming soon"},
		}
		db.Create(&moviesList)
	}

	var rooms int64
	db.Model(&domain.Room{}).Count(&rooms)
	if rooms == 0 {
		roomsList := []domain.Room{
			{Name: "CineVerse Hùng Vương - Cinema 01", Rows: 6, SeatsPerRow: 10, ScreenType: "2D"},
			{Name: "CineVerse Hùng Vương - Cinema 04", Rows: 8, SeatsPerRow: 12, ScreenType: "IMAX"},
			{Name: "CineVerse Hoàng Văn Thụ - Cinema 02", Rows: 6, SeatsPerRow: 10, ScreenType: "2D"},
			{Name: "CineVerse Hoàng Văn Thụ - Cinema 03", Rows: 6, SeatsPerRow: 10, ScreenType: "3D"},
		}
		for _, room := range roomsList {
			createRoomWithSeats(db, &room)
		}
	}

	var showtimes int64
	db.Model(&domain.Showtime{}).Count(&showtimes)
	if showtimes == 0 {
		var activeMovies []domain.Movie
		db.Where("status = ?", "now showing").Find(&activeMovies)

		var allRooms []domain.Room
		db.Find(&allRooms)

		times := []string{"10:00", "13:30", "16:45", "20:00"}

		for mIndex, movie := range activeMovies {
			room := allRooms[mIndex%len(allRooms)]
			ticketPrice := 95000.0
			if room.ScreenType == "IMAX" {
				ticketPrice = 140000.0
			} else if room.ScreenType == "3D" {
				ticketPrice = 110000.0
			}

			for d := 0; d < 3; d++ {
				showDate := time.Now().AddDate(0, 0, d).Format("2006-01-02")
				t1 := times[(mIndex+d)%len(times)]
				t2 := times[(mIndex+d+2)%len(times)]

				st1 := domain.Showtime{
					MovieID:     movie.ID,
					RoomID:      room.ID,
					ShowDate:    showDate,
					StartTime:   t1,
					EndTime:     calculateEndTime(t1, movie.DurationMinutes),
					TicketPrice: ticketPrice,
				}
				createShowtimeWithSeats(db, &st1)

				st2 := domain.Showtime{
					MovieID:     movie.ID,
					RoomID:      room.ID,
					ShowDate:    showDate,
					StartTime:   t2,
					EndTime:     calculateEndTime(t2, movie.DurationMinutes),
					TicketPrice: ticketPrice,
				}
				createShowtimeWithSeats(db, &st2)
			}
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
