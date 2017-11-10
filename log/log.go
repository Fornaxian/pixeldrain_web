package log

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"runtime/debug"
)

var logger *log.Logger

const (
	LEVEL_DEBUG   = 4
	LEVEL_INFO    = 3
	LEVEL_WARNING = 2
	LEVEL_ERROR   = 1
)

var logLevel = LEVEL_DEBUG

// Init initializes the logger
func Init() {
	logger = log.New(os.Stdout, "pdweb ", log.LUTC)
}

// SetLogLevel set the loggin verbosity. 0 is lowest (log nothing at all), 4 is
// highest (log all debug messages)
func SetLogLevel(level int) {
	if level < 0 || level > 4 {
		Error("Invalid log level %v", level)
		return
	}
	logLevel = level
}

// Debug logs a debug message
func Debug(msgFmt string, v ...interface{}) {
	if logLevel < LEVEL_DEBUG {
		return
	}
	if len(v) == 0 {
		print("DBG", msgFmt)
	} else {
		print("DBG", msgFmt, v...)
	}
}

// Info logs an info message
func Info(msgFmt string, v ...interface{}) {
	if logLevel < LEVEL_INFO {
		return
	}
	if len(v) == 0 {
		print("INF", msgFmt)
	} else {
		print("INF", msgFmt, v...)
	}
}

// Warn logs a warning message
func Warn(msgFmt string, v ...interface{}) {
	if logLevel < LEVEL_WARNING {
		return
	}
	if len(v) == 0 {
		print("WRN", msgFmt)
	} else {
		print("WRN", msgFmt, v...)
	}
}

// Error logs an error message
func Error(msgFmt string, v ...interface{}) {
	if logLevel < LEVEL_ERROR {
		return
	}
	if len(v) == 0 {
		print("ERR", msgFmt)
	} else {
		print("ERR", msgFmt, v...)
	}

	debug.PrintStack()
}

func print(lvl string, msgFmt string, v ...interface{}) {
	_, fn, line, _ := runtime.Caller(2)

	msg := fmt.Sprintf("[%s] …%s:%-3d %s", lvl, string(fn[len(fn)-20:]), line, msgFmt)

	if len(v) == 0 {
		logger.Println(msg)
	} else {
		logger.Printf(msg, v...)
	}
}
