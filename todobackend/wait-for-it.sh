#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

# The MIT License (MIT)
# 
# Copyright (c) 2016 Vincent Ambo
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

TIMEOUT=15
QUIET=0
PROGNAME=$(basename "$0")

echoerr() {
    if [ "$QUIET" -ne 1 ]; then echo "$@" 1>&2; fi
}

usage() {
    cat << USAGE >&2
Usage:
    $PROGNAME host:port [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP under test
    -p PORT | --port=PORT       TCP port under test
                                Alternatively, you specify the host and port as host:port
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for no timeout
    -q | --quiet                Don't output any status messages
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for() {
    if [ "$TIMEOUT" -gt 0 ]; then
        echoerr "$PROGNAME: waiting $TIMEOUT seconds for $HOST:$PORT"
    else
        echoerr "$PROGNAME: waiting for $HOST:$PORT without a timeout"
    fi
    start_ts=$(date +%s)
    while :
    do
        if [ "$ISBUSY" -eq 1 ]; then
            nc -z "$HOST" "$PORT"
            result=$?
        else
            (echo > /dev/tcp/"$HOST"/"$PORT") >/dev/null 2>&1
            result=$?
        fi
        if [ $result -eq 0 ] ; then
            end_ts=$(date +%s)
            echoerr "$PROGNAME: $HOST:$PORT is available after $((end_ts - start_ts)) seconds"
            break
        fi
        sleep 1
    done
    return $result
}

wait_for_wrapper() {
    # In order to support SIGINT during timeout: http://unix.stackexchange.com/a/57692
    if [ "$QUIET" -eq 1 ]; then
        timeout "$TIMEOUT" "$0" --quiet --child --host="$HOST" --port="$PORT" --timeout="$TIMEOUT" &
    else
        timeout "$TIMEOUT" "$0" --child --host="$HOST" --port="$PORT" --timeout="$TIMEOUT" &
    fi
    PID=$!
    trap "kill -INT -$PID" INT
    wait $PID
    RESULT=$?
    if [ $RESULT -ne 0 ]; then
        echoerr "$PROGNAME: timeout occurred after waiting $TIMEOUT seconds for $HOST:$PORT"
    fi
    return $RESULT
}

# process arguments
while [ $# -gt 0 ]
do
    case "$1" in
        *:* )
        HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
        PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
        shift 1
        ;;
        -h)
        HOST="$2"
        if [ "$HOST" = "" ]; then break; fi
        shift 2
        ;;
        --host=*)
        HOST=$(printf "%s\n" "$1"| cut -d = -f 2)
        shift 1
        ;;
        -p)
        PORT="$2"
        if [ "$PORT" = "" ]; then break; fi
        shift 2
        ;;
        --port=*)
        PORT=$(printf "%s\n" "$1"| cut -d = -f 2)
        shift 1
        ;;
        -t)
        TIMEOUT="$2"
        if [ "$TIMEOUT" = "" ]; then break; fi
        shift 2
        ;;
        --timeout=*)
        TIMEOUT=$(printf "%s\n" "$1"| cut -d = -f 2)
        shift 1
        ;;
        -q | --quiet)
        QUIET=1
        shift 1
        ;;
        --child)
        shift 1
        ISCHILD=1
        ;;
        -h | --help)
        usage
        ;;
        --)
        shift
        break
        ;;
        -*)
        echoerr "Unknown flag: $1"
        usage
        ;;
        *)
        break
        ;;
    esac
done

if [ "$HOST" = "" ] || [ "$PORT" = "" ]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

ISBUSY=0
if command -v busybox >/dev/null; then
    ISBUSY=1
fi

if [ ! -z "$ISCHILD" ]; then
    wait_for
    RESULT=$?
    exit $RESULT
else
    if [ "$TIMEOUT" -gt 0 ]; then
        wait_for_wrapper
        RESULT=$?
    else
        wait_for
        RESULT=$?
    fi
fi

if [ "$#" -gt 0 ] && [ $RESULT -eq 0 ]; then
    exec "$@"
else
    exit $RESULT
fi

