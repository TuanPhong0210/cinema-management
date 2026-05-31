package graphql

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"cinema-management/server/internal/domain"
	"cinema-management/server/internal/usecase"
	gql "github.com/graphql-go/graphql"
)

type ctxKey string

const tokenKey ctxKey = "token"

type Handler struct {
	uc                   *usecase.Usecase
	schema               gql.Schema
	movieObj             *gql.Object
	roomObj              *gql.Object
	seatObj              *gql.Object
	showtimeObj          *gql.Object
	showtimeSeatObj      *gql.Object
	ticketObj            *gql.Object
	ticketSeatObj        *gql.Object
	employeeObj          *gql.Object
	attendanceObj        *gql.Object
	managerObj           *gql.Object
	authPayloadObj       *gql.Object
	dashboardObj         *gql.Object
	userObj              *gql.Object
	clientAuthPayloadObj *gql.Object
}

func NewHandler(uc *usecase.Usecase) (*Handler, error) {
	h := &Handler{uc: uc}
	schema, err := gql.NewSchema(gql.SchemaConfig{Query: h.query(), Mutation: h.mutation()})
	h.schema = schema
	return h, err
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Query     string                 `json:"query"`
		Variables map[string]interface{} `json:"variables"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	result := gql.Do(gql.Params{
		Schema:         h.schema,
		RequestString:  body.Query,
		VariableValues: body.Variables,
		Context:        context.WithValue(r.Context(), tokenKey, token),
	})
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(result)
}

func (h *Handler) query() *gql.Object {
	movieType := h.movieType()
	roomType := h.roomType()
	seatType := h.seatType()
	showtimeType := h.showtimeType(movieType, roomType)
	showtimeSeatType := h.showtimeSeatType(seatType)
	ticketType := h.ticketType(showtimeType)
	employeeType := h.employeeType()
	attendanceType := h.attendanceType(employeeType)

	return gql.NewObject(gql.ObjectConfig{Name: "Query", Fields: gql.Fields{
		"dashboard":        &gql.Field{Type: h.dashboardType(), Resolve: h.auth(func(p gql.ResolveParams) (interface{}, error) { return h.uc.Dashboard() })},
		"movies":           listField(movieType, h.auth(h.listMovies)),
		"activeMovies":     listField(movieType, h.listActiveMovies),
		"movie":            oneField(movieType, h.movieByID),
		"rooms":            listField(roomType, h.auth(h.listRooms)),
		"roomSeats":        listWithID(seatType, h.roomSeats),
		"showtimes":        listField(showtimeType, h.auth(h.listShowtimes)),
		"showtime":         oneField(showtimeType, h.showtimeByID),
		"showtimesByMovie": listWithID(showtimeType, h.showtimesByMovie),
		"showtimesByDate":  &gql.Field{Type: gql.NewList(showtimeType), Args: gql.FieldConfigArgument{"date": &gql.ArgumentConfig{Type: gql.NewNonNull(gql.String)}}, Resolve: h.showtimesByDate},
		"showtimeSeats":    listWithID(showtimeSeatType, h.showtimeSeats),
		"tickets":          listField(ticketType, h.auth(h.listTickets)),
		"employees":        listField(employeeType, h.auth(h.listEmployees)),
		"attendances":      listField(attendanceType, h.auth(h.listAttendances)),
		"me": &gql.Field{
			Type: h.userType(),
			Resolve: func(p gql.ResolveParams) (interface{}, error) {
				token, _ := p.Context.Value(tokenKey).(string)
				uid, err := h.uc.ParseTokenUserID(token)
				if err != nil {
					return nil, err
				}
				var user domain.User
				err = h.uc.Repo.DB.First(&user, uid).Error
				return user, err
			},
		},
	}})
}

func (h *Handler) mutation() *gql.Object {
	movieType := h.movieType()
	roomType := h.roomType()
	employeeType := h.employeeType()
	showtimeType := h.showtimeType(movieType, roomType)
	ticketType := h.ticketType(showtimeType)
	attendanceType := h.attendanceType(employeeType)

	return gql.NewObject(gql.ObjectConfig{Name: "Mutation", Fields: gql.Fields{
		"login":              &gql.Field{Type: h.authPayloadType(), Args: gql.FieldConfigArgument{"email": argString(), "password": argString()}, Resolve: h.login},
		"createMovie":        &gql.Field{Type: movieType, Args: movieArgs(false), Resolve: h.auth(h.createMovie)},
		"updateMovie":        &gql.Field{Type: movieType, Args: withID(movieArgs(true)), Resolve: h.auth(h.updateMovie)},
		"deleteMovie":        &gql.Field{Type: gql.Boolean, Args: idArg(), Resolve: h.auth(h.deleteMovie)},
		"createRoom":         &gql.Field{Type: roomType, Args: roomArgs(false), Resolve: h.auth(h.createRoom)},
		"updateRoom":         &gql.Field{Type: roomType, Args: withID(roomArgs(true)), Resolve: h.auth(h.updateRoom)},
		"deleteRoom":         &gql.Field{Type: gql.Boolean, Args: idArg(), Resolve: h.auth(h.deleteRoom)},
		"createShowtime":     &gql.Field{Type: showtimeType, Args: showtimeArgs(false), Resolve: h.auth(h.createShowtime)},
		"updateShowtime":     &gql.Field{Type: showtimeType, Args: withID(showtimeArgs(true)), Resolve: h.auth(h.updateShowtime)},
		"deleteShowtime":     &gql.Field{Type: gql.Boolean, Args: idArg(), Resolve: h.auth(h.deleteShowtime)},
		"bookTickets":        &gql.Field{Type: ticketType, Args: gql.FieldConfigArgument{"showtimeId": argID(), "seatIds": &gql.ArgumentConfig{Type: gql.NewNonNull(gql.NewList(gql.NewNonNull(gql.ID)))}, "customerName": &gql.ArgumentConfig{Type: gql.String}, "userId": &gql.ArgumentConfig{Type: gql.ID}}, Resolve: h.bookTickets},
		"updateTicketStatus": &gql.Field{Type: ticketType, Args: gql.FieldConfigArgument{"id": argID(), "status": argString()}, Resolve: h.auth(h.updateTicketStatus)},
		"createEmployee":     &gql.Field{Type: employeeType, Args: employeeArgs(false), Resolve: h.auth(h.createEmployee)},
		"updateEmployee":     &gql.Field{Type: employeeType, Args: withID(employeeArgs(true)), Resolve: h.auth(h.updateEmployee)},
		"deleteEmployee":     &gql.Field{Type: gql.Boolean, Args: idArg(), Resolve: h.auth(h.deleteEmployee)},
		"clockIn":            &gql.Field{Type: attendanceType, Args: gql.FieldConfigArgument{"employeeId": argID()}, Resolve: h.auth(h.clockIn)},
		"clockOut":           &gql.Field{Type: attendanceType, Args: gql.FieldConfigArgument{"employeeId": argID()}, Resolve: h.auth(h.clockOut)},
		"clientLogin": &gql.Field{
			Type: h.clientAuthPayloadType(),
			Args: gql.FieldConfigArgument{
				"email":    argString(),
				"password": argString(),
			},
			Resolve: func(p gql.ResolveParams) (interface{}, error) {
				email := p.Args["email"].(string)
				password := p.Args["password"].(string)
				return h.uc.ClientLogin(email, password)
			},
		},
		"clientRegister": &gql.Field{
			Type: h.clientAuthPayloadType(),
			Args: gql.FieldConfigArgument{
				"fullName": argString(),
				"email":    argString(),
				"password": argString(),
				"phone":    argString(),
			},
			Resolve: func(p gql.ResolveParams) (interface{}, error) {
				fullName := p.Args["fullName"].(string)
				email := p.Args["email"].(string)
				password := p.Args["password"].(string)
				phone := p.Args["phone"].(string)
				return h.uc.ClientRegister(fullName, email, password, phone)
			},
		},
	}})
}

func (h *Handler) auth(next gql.FieldResolveFn) gql.FieldResolveFn {
	return func(p gql.ResolveParams) (interface{}, error) {
		if err := h.uc.RequireManager(p.Context.Value(tokenKey).(string)); err != nil {
			return nil, err
		}
		return next(p)
	}
}

func (h *Handler) login(p gql.ResolveParams) (interface{}, error) {
	token, manager, err := h.uc.Login(p.Args["email"].(string), p.Args["password"].(string))
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"token": token, "manager": manager}, nil
}

func (h *Handler) listMovies(gql.ResolveParams) (interface{}, error) {
	var items []domain.Movie
	return items, h.uc.Repo.DB.Order("id desc").Find(&items).Error
}
func (h *Handler) listActiveMovies(gql.ResolveParams) (interface{}, error) {
	var items []domain.Movie
	return items, h.uc.Repo.DB.Where("status = ?", "now showing").Order("id desc").Find(&items).Error
}
func (h *Handler) movieByID(p gql.ResolveParams) (interface{}, error) {
	var item domain.Movie
	return item, h.uc.Repo.DB.First(&item, toUint(p.Args["id"])).Error
}
func (h *Handler) listRooms(gql.ResolveParams) (interface{}, error) {
	var items []domain.Room
	return items, h.uc.Repo.DB.Preload("Seats").Order("id desc").Find(&items).Error
}
func (h *Handler) roomSeats(p gql.ResolveParams) (interface{}, error) {
	var items []domain.Seat
	return items, h.uc.Repo.DB.Where("room_id = ?", toUint(p.Args["id"])).Order("row_label, seat_number").Find(&items).Error
}
func (h *Handler) listShowtimes(gql.ResolveParams) (interface{}, error) {
	var items []domain.Showtime
	return items, h.uc.Repo.DB.Preload("Movie").Preload("Room").Order("show_date, start_time").Find(&items).Error
}
func (h *Handler) showtimeByID(p gql.ResolveParams) (interface{}, error) {
	var item domain.Showtime
	return item, h.uc.Repo.DB.Preload("Movie").Preload("Room").First(&item, toUint(p.Args["id"])).Error
}
func (h *Handler) showtimesByMovie(p gql.ResolveParams) (interface{}, error) {
	var items []domain.Showtime
	return items, h.uc.Repo.DB.Preload("Movie").Preload("Room").Where("movie_id = ?", toUint(p.Args["id"])).Order("show_date, start_time").Find(&items).Error
}
func (h *Handler) showtimesByDate(p gql.ResolveParams) (interface{}, error) {
	var items []domain.Showtime
	return items, h.uc.Repo.DB.Preload("Movie").Preload("Room").Where("show_date = ?", p.Args["date"]).Order("start_time").Find(&items).Error
}
func (h *Handler) showtimeSeats(p gql.ResolveParams) (interface{}, error) {
	var items []domain.ShowtimeSeat
	return items, h.uc.Repo.DB.Preload("Seat").Where("showtime_id = ?", toUint(p.Args["id"])).Joins("JOIN seats ON seats.id = showtime_seats.seat_id").Order("seats.row_label, seats.seat_number").Find(&items).Error
}
func (h *Handler) listTickets(gql.ResolveParams) (interface{}, error) {
	var items []domain.Ticket
	return items, h.uc.Repo.DB.Preload("Seats").Preload("Showtime.Movie").Preload("Showtime.Room").Order("id desc").Find(&items).Error
}
func (h *Handler) listEmployees(gql.ResolveParams) (interface{}, error) {
	var items []domain.Employee
	return items, h.uc.Repo.DB.Order("id desc").Find(&items).Error
}
func (h *Handler) listAttendances(gql.ResolveParams) (interface{}, error) {
	var items []domain.Attendance
	return items, h.uc.Repo.DB.Preload("Employee").Order("id desc").Find(&items).Error
}

func (h *Handler) createMovie(p gql.ResolveParams) (interface{}, error) {
	item := movieFromArgs(p, domain.Movie{})
	return item, h.uc.Repo.DB.Create(&item).Error
}
func (h *Handler) updateMovie(p gql.ResolveParams) (interface{}, error) {
	var item domain.Movie
	h.uc.Repo.DB.First(&item, toUint(p.Args["id"]))
	item = movieFromArgs(p, item)
	return item, h.uc.Repo.DB.Save(&item).Error
}
func (h *Handler) deleteMovie(p gql.ResolveParams) (interface{}, error) {
	return true, h.uc.DeleteByID(&domain.Movie{}, toUint(p.Args["id"]))
}
func (h *Handler) createRoom(p gql.ResolveParams) (interface{}, error) {
	item := roomFromArgs(p, domain.Room{})
	return item, h.uc.Repo.CreateRoom(&item)
}
func (h *Handler) updateRoom(p gql.ResolveParams) (interface{}, error) {
	var item domain.Room
	h.uc.Repo.DB.First(&item, toUint(p.Args["id"]))
	item = roomFromArgs(p, item)
	return item, h.uc.Repo.UpdateRoom(&item)
}
func (h *Handler) deleteRoom(p gql.ResolveParams) (interface{}, error) {
	return true, h.uc.DeleteByID(&domain.Room{}, toUint(p.Args["id"]))
}
func (h *Handler) createShowtime(p gql.ResolveParams) (interface{}, error) {
	item := showtimeFromArgs(p, domain.Showtime{})
	err := h.uc.Repo.CreateShowtime(&item)
	h.uc.Repo.DB.Preload("Movie").Preload("Room").First(&item, item.ID)
	return item, err
}
func (h *Handler) updateShowtime(p gql.ResolveParams) (interface{}, error) {
	var item domain.Showtime
	h.uc.Repo.DB.First(&item, toUint(p.Args["id"]))
	item = showtimeFromArgs(p, item)
	err := h.uc.Repo.DB.Save(&item).Error
	h.uc.Repo.DB.Preload("Movie").Preload("Room").First(&item, item.ID)
	return item, err
}
func (h *Handler) deleteShowtime(p gql.ResolveParams) (interface{}, error) {
	return true, h.uc.DeleteByID(&domain.Showtime{}, toUint(p.Args["id"]))
}
func (h *Handler) bookTickets(p gql.ResolveParams) (interface{}, error) {
	var ids []uint
	for _, raw := range p.Args["seatIds"].([]interface{}) {
		ids = append(ids, toUint(raw))
	}
	var name *string
	if v, ok := p.Args["customerName"].(string); ok && v != "" {
		name = &v
	}
	var userID *uint
	if uidVal, ok := p.Args["userId"]; ok && uidVal != nil {
		uid := toUint(uidVal)
		if uid > 0 {
			userID = &uid
		}
	} else {
		token, _ := p.Context.Value(tokenKey).(string)
		if uid, err := h.uc.ParseTokenUserID(token); err == nil && uid > 0 {
			userID = &uid
		}
	}
	return h.uc.Repo.BookTickets(toUint(p.Args["showtimeId"]), ids, name, userID)
}
func (h *Handler) updateTicketStatus(p gql.ResolveParams) (interface{}, error) {
	var item domain.Ticket
	h.uc.Repo.DB.First(&item, toUint(p.Args["id"]))
	item.Status = p.Args["status"].(string)
	err := h.uc.Repo.DB.Save(&item).Error
	h.uc.Repo.DB.Preload("Seats").Preload("Showtime.Movie").Preload("Showtime.Room").First(&item, item.ID)
	return item, err
}
func (h *Handler) createEmployee(p gql.ResolveParams) (interface{}, error) {
	item := employeeFromArgs(p, domain.Employee{})
	return item, h.uc.Repo.DB.Create(&item).Error
}
func (h *Handler) updateEmployee(p gql.ResolveParams) (interface{}, error) {
	var item domain.Employee
	h.uc.Repo.DB.First(&item, toUint(p.Args["id"]))
	item = employeeFromArgs(p, item)
	return item, h.uc.Repo.DB.Save(&item).Error
}
func (h *Handler) deleteEmployee(p gql.ResolveParams) (interface{}, error) {
	return true, h.uc.DeleteByID(&domain.Employee{}, toUint(p.Args["id"]))
}
func (h *Handler) clockIn(p gql.ResolveParams) (interface{}, error) {
	return h.uc.Repo.ClockIn(toUint(p.Args["employeeId"]))
}
func (h *Handler) clockOut(p gql.ResolveParams) (interface{}, error) {
	return h.uc.Repo.ClockOut(toUint(p.Args["employeeId"]))
}

func (h *Handler) movieType() *gql.Object {
	if h.movieObj == nil {
		h.movieObj = gql.NewObject(gql.ObjectConfig{Name: "Movie", Fields: gql.Fields{"id": gqlID(), "title": gqlString(), "description": gqlString(), "genre": gqlString(), "durationMinutes": gqlInt(), "posterUrl": gqlString(), "status": gqlString()}})
	}
	return h.movieObj
}
func (h *Handler) seatType() *gql.Object {
	if h.seatObj == nil {
		h.seatObj = gql.NewObject(gql.ObjectConfig{Name: "Seat", Fields: gql.Fields{"id": gqlID(), "roomId": gqlInt(), "rowLabel": gqlString(), "seatNumber": gqlInt(), "seatCode": gqlString()}})
	}
	return h.seatObj
}
func (h *Handler) roomType() *gql.Object {
	if h.roomObj == nil {
		h.roomObj = gql.NewObject(gql.ObjectConfig{Name: "Room", Fields: gql.Fields{"id": gqlID(), "name": gqlString(), "rows": gqlInt(), "seatsPerRow": gqlInt(), "screenType": gqlString()}})
	}
	return h.roomObj
}
func (h *Handler) showtimeType(movieType, roomType *gql.Object) *gql.Object {
	if h.showtimeObj == nil {
		h.showtimeObj = gql.NewObject(gql.ObjectConfig{Name: "Showtime", Fields: gql.Fields{"id": gqlID(), "movieId": gqlInt(), "roomId": gqlInt(), "movie": &gql.Field{Type: movieType}, "room": &gql.Field{Type: roomType}, "showDate": gqlString(), "startTime": gqlString(), "endTime": gqlString(), "ticketPrice": gqlFloat()}})
	}
	return h.showtimeObj
}
func (h *Handler) showtimeSeatType(seatType *gql.Object) *gql.Object {
	if h.showtimeSeatObj == nil {
		h.showtimeSeatObj = gql.NewObject(gql.ObjectConfig{Name: "ShowtimeSeat", Fields: gql.Fields{"id": gqlID(), "showtimeId": gqlInt(), "seatId": gqlInt(), "seat": &gql.Field{Type: seatType}, "status": gqlString()}})
	}
	return h.showtimeSeatObj
}
func (h *Handler) ticketType(showtimeType *gql.Object) *gql.Object {
	if h.ticketSeatObj == nil {
		h.ticketSeatObj = gql.NewObject(gql.ObjectConfig{Name: "TicketSeat", Fields: gql.Fields{"id": gqlID(), "seatCode": gqlString(), "price": gqlFloat()}})
	}
	if h.ticketObj == nil {
		h.ticketObj = gql.NewObject(gql.ObjectConfig{
			Name: "Ticket",
			Fields: gql.Fields{
				"id":           gqlID(),
				"showtimeId":   gqlInt(),
				"showtime":     &gql.Field{Type: showtimeType},
				"userId":       gqlInt(),
				"user":         &gql.Field{Type: h.userType()},
				"customerName": gqlString(),
				"totalPrice":   gqlFloat(),
				"status":       gqlString(),
				"seats":        &gql.Field{Type: gql.NewList(h.ticketSeatObj)},
			},
		})
	}
	return h.ticketObj
}
func (h *Handler) employeeType() *gql.Object {
	if h.employeeObj == nil {
		h.employeeObj = gql.NewObject(gql.ObjectConfig{Name: "Employee", Fields: gql.Fields{"id": gqlID(), "fullName": gqlString(), "email": gqlString(), "phone": gqlString(), "role": gqlString(), "isOnShift": &gql.Field{Type: gql.Boolean}}})
	}
	return h.employeeObj
}
func (h *Handler) attendanceType(employeeType *gql.Object) *gql.Object {
	if h.attendanceObj == nil {
		h.attendanceObj = gql.NewObject(gql.ObjectConfig{Name: "Attendance", Fields: gql.Fields{"id": gqlID(), "employeeId": gqlInt(), "employee": &gql.Field{Type: employeeType}, "clockInTime": gqlString(), "clockOutTime": gqlString()}})
	}
	return h.attendanceObj
}
func (h *Handler) dashboardType() *gql.Object {
	if h.dashboardObj == nil {
		h.dashboardObj = gql.NewObject(gql.ObjectConfig{Name: "Dashboard", Fields: gql.Fields{"totalMovies": gqlInt(), "totalShowtimes": gqlInt(), "totalTicketsSold": gqlInt(), "employeesOnShift": gqlInt(), "revenue": gqlFloat()}})
	}
	return h.dashboardObj
}
func (h *Handler) authPayloadType() *gql.Object {
	if h.managerObj == nil {
		h.managerObj = gql.NewObject(gql.ObjectConfig{Name: "Manager", Fields: gql.Fields{"id": gqlID(), "name": gqlString(), "email": gqlString()}})
	}
	if h.authPayloadObj == nil {
		h.authPayloadObj = gql.NewObject(gql.ObjectConfig{Name: "AuthPayload", Fields: gql.Fields{"token": gqlString(), "manager": &gql.Field{Type: h.managerObj}}})
	}
	return h.authPayloadObj
}

func (h *Handler) userType() *gql.Object {
	if h.userObj == nil {
		h.userObj = gql.NewObject(gql.ObjectConfig{
			Name: "User",
			Fields: gql.FieldsThunk(func() gql.Fields {
				return gql.Fields{
					"id":        gqlID(),
					"fullName":  gqlString(),
					"email":     gqlString(),
					"phone":     gqlString(),
					"role":      gqlString(),
					"createdAt": gqlString(),
					"tickets": &gql.Field{
						Type: gql.NewList(h.ticketType(h.showtimeType(h.movieType(), h.roomType()))),
						Resolve: func(p gql.ResolveParams) (interface{}, error) {
							user := p.Source.(domain.User)
							var tickets []domain.Ticket
							err := h.uc.Repo.DB.Preload("Seats").Preload("Showtime.Movie").Preload("Showtime.Room").Where("user_id = ?", user.ID).Order("id desc").Find(&tickets).Error
							return tickets, err
						},
					},
				}
			}),
		})
	}
	return h.userObj
}

func (h *Handler) clientAuthPayloadType() *gql.Object {
	if h.clientAuthPayloadObj == nil {
		h.clientAuthPayloadObj = gql.NewObject(gql.ObjectConfig{
			Name: "ClientAuthPayload",
			Fields: gql.Fields{
				"token": gqlString(),
				"user":  &gql.Field{Type: h.userType()},
			},
		})
	}
	return h.clientAuthPayloadObj
}

func movieArgs(optional bool) gql.FieldConfigArgument {
	return args(map[string]gql.Type{"title": gql.String, "description": gql.String, "genre": gql.String, "durationMinutes": gql.Int, "posterUrl": gql.String, "status": gql.String}, optional)
}
func roomArgs(optional bool) gql.FieldConfigArgument {
	return args(map[string]gql.Type{"name": gql.String, "rows": gql.Int, "seatsPerRow": gql.Int, "screenType": gql.String}, optional)
}
func showtimeArgs(optional bool) gql.FieldConfigArgument {
	return args(map[string]gql.Type{"movieId": gql.ID, "roomId": gql.ID, "showDate": gql.String, "startTime": gql.String, "endTime": gql.String, "ticketPrice": gql.Float}, optional)
}
func employeeArgs(optional bool) gql.FieldConfigArgument {
	return args(map[string]gql.Type{"fullName": gql.String, "email": gql.String, "phone": gql.String, "role": gql.String, "isOnShift": gql.Boolean}, optional)
}
func args(types map[string]gql.Type, optional bool) gql.FieldConfigArgument {
	out := gql.FieldConfigArgument{}
	for k, t := range types {
		if optional {
			out[k] = &gql.ArgumentConfig{Type: t}
		} else {
			out[k] = &gql.ArgumentConfig{Type: gql.NewNonNull(t)}
		}
	}
	return out
}
func withID(a gql.FieldConfigArgument) gql.FieldConfigArgument { a["id"] = argID(); return a }
func idArg() gql.FieldConfigArgument                           { return gql.FieldConfigArgument{"id": argID()} }
func argID() *gql.ArgumentConfig                               { return &gql.ArgumentConfig{Type: gql.NewNonNull(gql.ID)} }
func argString() *gql.ArgumentConfig                           { return &gql.ArgumentConfig{Type: gql.NewNonNull(gql.String)} }
func gqlID() *gql.Field                                        { return &gql.Field{Type: gql.ID} }
func gqlString() *gql.Field                                    { return &gql.Field{Type: gql.String} }
func gqlInt() *gql.Field                                       { return &gql.Field{Type: gql.Int} }
func gqlFloat() *gql.Field                                     { return &gql.Field{Type: gql.Float} }
func listField(t *gql.Object, r gql.FieldResolveFn) *gql.Field {
	return &gql.Field{Type: gql.NewList(t), Resolve: r}
}
func oneField(t *gql.Object, r gql.FieldResolveFn) *gql.Field {
	return &gql.Field{Type: t, Args: idArg(), Resolve: r}
}
func listWithID(t *gql.Object, r gql.FieldResolveFn) *gql.Field {
	return &gql.Field{Type: gql.NewList(t), Args: idArg(), Resolve: r}
}

func toUint(v interface{}) uint {
	n, _ := strconv.ParseUint(strings.TrimSpace(toString(v)), 10, 64)
	return uint(n)
}
func toString(v interface{}) string {
	switch t := v.(type) {
	case string:
		return t
	case int:
		return strconv.Itoa(t)
	case int64:
		return strconv.FormatInt(t, 10)
	case float64:
		return strconv.Itoa(int(t))
	default:
		return ""
	}
}
func setString(args map[string]interface{}, key string, dst *string) {
	if v, ok := args[key].(string); ok {
		*dst = v
	}
}
func setInt(args map[string]interface{}, key string, dst *int) {
	if v, ok := args[key].(int); ok {
		*dst = v
	}
}
func setFloat(args map[string]interface{}, key string, dst *float64) {
	if v, ok := args[key].(float64); ok {
		*dst = v
	}
}
func setBool(args map[string]interface{}, key string, dst *bool) {
	if v, ok := args[key].(bool); ok {
		*dst = v
	}
}
func setID(args map[string]interface{}, key string, dst *uint) {
	if v, ok := args[key]; ok {
		*dst = toUint(v)
	}
}

func movieFromArgs(p gql.ResolveParams, m domain.Movie) domain.Movie {
	setString(p.Args, "title", &m.Title)
	setString(p.Args, "description", &m.Description)
	setString(p.Args, "genre", &m.Genre)
	setInt(p.Args, "durationMinutes", &m.DurationMinutes)
	setString(p.Args, "posterUrl", &m.PosterURL)
	setString(p.Args, "status", &m.Status)
	return m
}
func roomFromArgs(p gql.ResolveParams, r domain.Room) domain.Room {
	setString(p.Args, "name", &r.Name)
	setInt(p.Args, "rows", &r.Rows)
	setInt(p.Args, "seatsPerRow", &r.SeatsPerRow)
	setString(p.Args, "screenType", &r.ScreenType)
	return r
}
func showtimeFromArgs(p gql.ResolveParams, s domain.Showtime) domain.Showtime {
	setID(p.Args, "movieId", &s.MovieID)
	setID(p.Args, "roomId", &s.RoomID)
	setString(p.Args, "showDate", &s.ShowDate)
	setString(p.Args, "startTime", &s.StartTime)
	setString(p.Args, "endTime", &s.EndTime)
	setFloat(p.Args, "ticketPrice", &s.TicketPrice)
	return s
}
func employeeFromArgs(p gql.ResolveParams, e domain.Employee) domain.Employee {
	setString(p.Args, "fullName", &e.FullName)
	setString(p.Args, "email", &e.Email)
	setString(p.Args, "phone", &e.Phone)
	setString(p.Args, "role", &e.Role)
	setBool(p.Args, "isOnShift", &e.IsOnShift)
	return e
}
