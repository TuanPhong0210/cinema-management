package grpcdelivery

import (
	"net"

	"cinema-management/backend/internal/usecase"
	"google.golang.org/grpc"
)

type Server struct {
	uc *usecase.Usecase
}

type serviceShell interface{}

func NewServer(uc *usecase.Usecase) *Server {
	return &Server{uc: uc}
}

func (s *Server) Start(addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	server := grpc.NewServer()
	registerServiceShells(server, s)
	return server.Serve(listener)
}

func registerServiceShells(server *grpc.Server, handler *Server) {
	for _, name := range []string{
		"cinema.MovieService",
		"cinema.ShowtimeService",
		"cinema.TicketService",
		"cinema.EmployeeService",
		"cinema.AttendanceService",
	} {
		server.RegisterService(&grpc.ServiceDesc{
			ServiceName: name,
			HandlerType: (*serviceShell)(nil),
			Methods:     []grpc.MethodDesc{},
			Streams:     []grpc.StreamDesc{},
			Metadata:    "proto/cinema.proto",
		}, handler)
	}
}
