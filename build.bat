@echo off
go build -buildmode=c-shared -o .bin/release/broker_lib.dll broker_lib.go
