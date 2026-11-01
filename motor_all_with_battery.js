var battery_before_v;
var battery_before_ms;
var __interpretation_started_timestamp__;
var pi = 3.141592653589793;

var A;

var P;

var T;

var duration;

var fraction;

var level;

var manual_battery;

var mode;

var note;

var phase;

var rep;

var segment;

var st;

var start;

var t;

var t0;

var tau;

var theta_l;

var theta_r;

var u;

/* Subprograms declarations */

var record;

var signals;

var steps;

var battery_note;

/* Subprograms implementations */

record = function()
{
	
	
	while ((Date.now() - __interpretation_started_timestamp__) - start < duration) {
		if (phase >= 3) {
			tau = (Date.now() - __interpretation_started_timestamp__) - start;
			fraction = tau / P - Math.floor(tau / P);
			u = (2 - rep) * A * (1 - 2 * Math.floor(2 * fraction)) + (rep - 1) * Math.floor(A * (2 * fraction - 1) + 0.5);
			segment = segment + 1;
			t0 = (Date.now() - __interpretation_started_timestamp__);
			brick.motor(M4).setPower(u);
			
			brick.motor(M3).setPower(-u);
			
		}
		theta_l = brick.encoder(E4).read();
		theta_r = brick.encoder(E3).read();
		t = (Date.now() - __interpretation_started_timestamp__);
		st = theta_l + "," + t + "," + u + "," + theta_r + "," + -u + "," + rep + "," + phase + "," + segment + "," + t0 + "\n";
		if (mode == 1) {
			script.writeToFile("log/steps_240057.txt", st);
			
		} else {
			script.writeToFile("log/signal_240057.txt", st);
			
		}
		script.wait(5);
		
	}
	return;
	
}

signals = function()
{
	
	mode = 2;
	note = "Before";
	battery_note();
	
	phase = 0;
	u = 0;
	duration = 3000;
	segment = segment + 1;
	start = (Date.now() - __interpretation_started_timestamp__);
	t0 = start;
	record();
	
	phase = rep + 2;
	u = 0;
	duration = T;
	segment = segment + 1;
	start = (Date.now() - __interpretation_started_timestamp__);
	t0 = start;
	record();
	
	brick.motor(M3).powerOff();
	brick.motor(M4).powerOff();
	
	phase = 2;
	u = 0;
	duration = 1000;
	segment = segment + 1;
	start = (Date.now() - __interpretation_started_timestamp__);
	t0 = start;
	record();
	
	note = "After";
	battery_note();
	
	return;
	
}

steps = function()
{
	
	mode = 1;
	note = "Before";
	battery_note();
	
	phase = 0;
	u = 0;
	duration = 3000;
	segment = segment + 1;
	start = (Date.now() - __interpretation_started_timestamp__);
	t0 = start;
	record();
	
	level = -100;
	
	while (level <= 100) {
		phase = 1;
		u = level;
		duration = 2000;
		segment = segment + 1;
		start = (Date.now() - __interpretation_started_timestamp__);
		t0 = start;
		brick.motor(M4).setPower(u);
		
		brick.motor(M3).setPower(-u);
		
		record();
		
		brick.motor(M3).powerOff();
		brick.motor(M4).powerOff();
		
		phase = 2;
		u = 0;
		duration = 1000;
		segment = segment + 1;
		start = (Date.now() - __interpretation_started_timestamp__);
		t0 = start;
		record();
		
		level = level + 10;
	}
	note = "After";
	battery_note();
	
	return;
	
}

battery_note = function()
{
    brick.motor(M3).powerOff();
    brick.motor(M4).powerOff();
    var reading = brick.battery().readVoltage();
    var readingTime = Date.now() - __interpretation_started_timestamp__;
    if (!(reading > 0 && reading < 30)) {
        throw new Error("Battery reading is not in volts: " + reading);
    }
    if (note == "Before") {
        battery_before_v = reading;
        battery_before_ms = readingTime;
    } else {
        script.writeToFile("log/battery_240057.txt",
            mode + "," + rep + "," + battery_before_ms + "," + battery_before_v + "," + readingTime + "," + reading + "\n");
    }
    brick.display().addLabel(note + " run " + mode + "." + rep + ": " + reading + " V", 1, 1, 12);
    brick.display().redraw();
};

var main = function()
{
	__interpretation_started_timestamp__ = Date.now();
    script.removeFile("log/battery_240057.txt");
	
	brick.motor(M3).powerOff();
	brick.motor(M4).powerOff();
	
	segment = 0;
	manual_battery = 0;
	A = 60;
	P = 1000.0;
	T = 8000;
	rep = 1;
	script.removeFile("log/steps_240057.txt");
	
	script.removeFile("log/signal_240057.txt");
	
	
	while (rep <= 2) {
		steps();
		
		rep = rep + 1;
	}
	rep = 1;
	signals();
	
	rep = 2;
	signals();
	
	brick.motor(M3).powerOff();
	brick.motor(M4).powerOff();
	
	return;
}
