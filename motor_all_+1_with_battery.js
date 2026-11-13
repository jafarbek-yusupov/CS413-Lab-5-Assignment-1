var __interpretation_started_timestamp__;
var pi = 3.141592653589793;
var A;
var P;
var P3;
var T;
var Tc;
var duration;
var f0;
var f1;
var fraction;
var fraction3;
var mode;
var phase;
var rep;
var sawtooth_pwm;
var segment;
var square_pwm;
var st;
var start;
var t;
var t0;
var tau;
var theta_l;
var theta_r;
var triangle_pwm;
var u;

var record;
var signals;
var battery_note;

battery_note = function(stage)
{
    var names = ["", "square", "sawtooth", "triangle"];
    var voltage = Number(brick.battery().readVoltage());
    var reading_ms = Date.now() - __interpretation_started_timestamp__;
    if (!isFinite(voltage) || voltage <= 0 || voltage >= 30) {
        throw new Error("Expected battery voltage in volts; received " + voltage);
    }
    script.writeToFile("log/battery_sigs_57.txt",
        rep + "," + names[rep] + "," + stage + "," + phase + "," +
        reading_ms + "," + voltage + "\n");
};

record = function()
{
    while ((Date.now() - __interpretation_started_timestamp__) - start < duration) {
        if (phase >= 3) {
            tau = (Date.now() - __interpretation_started_timestamp__) - start;
            fraction = tau / P - Math.floor(tau / P);
            fraction3 = tau / P3 - Math.floor(tau / P3);
            square_pwm = A * (1 - 2 * Math.floor(2 * fraction));
            sawtooth_pwm = Math.floor(A * (2 * fraction - 1) + 0.5);
            triangle_pwm = Math.floor(A * (1 - 4 * Math.abs(fraction3 - 0.5)) + 0.5);
            u = (rep - 2) * (rep - 3) / 2 * square_pwm +
                (rep - 1) * (3 - rep) * sawtooth_pwm +
                (rep - 1) * (rep - 2) / 2 * triangle_pwm;
            segment = segment + 1;
            t0 = Date.now() - __interpretation_started_timestamp__;
            brick.motor(M4).setPower(u);
            brick.motor(M3).setPower(-u);
        }
        theta_l = brick.encoder(E4).read();
        theta_r = brick.encoder(E3).read();
        t = Date.now() - __interpretation_started_timestamp__;
        st = theta_l + "," + t + "," + u + "," + theta_r + "," + -u + "," +
            rep + "," + phase + "," + segment + "," + t0 + "\n";
        script.writeToFile("log/sigs_57.txt", st);
        script.wait(5);
    }
};

signals = function()
{
    mode = 2;
    phase = 0;
    u = 0;
    duration = 3000;
    segment = segment + 1;
    start = Date.now() - __interpretation_started_timestamp__;
    t0 = start;
    record();

    battery_note("before");

    phase = rep + 2;
    u = 0;
    duration = T;
    segment = segment + 1;
    start = Date.now() - __interpretation_started_timestamp__;
    t0 = start;
    record();

    brick.motor(M3).powerOff();
    brick.motor(M4).powerOff();

    phase = 2;
    u = 0;
    duration = 1000;
    segment = segment + 1;
    start = Date.now() - __interpretation_started_timestamp__;
    t0 = start;
    record();

    battery_note("after");
};

var main = function()
{
    __interpretation_started_timestamp__ = Date.now();
    try {
        brick.motor(M3).powerOff();
        brick.motor(M4).powerOff();

        segment = 0;
        A = 60;
        P = 1000.0;
        P3 = 4000.0;
        T = 8000;
        f0 = 0.2;
        f1 = 3;
        Tc = 8;

        script.removeFile("log/sigs_57.txt");
        script.removeFile("log/battery_sigs_57.txt");
        script.writeToFile("log/battery_sigs_57.txt",
            "rep,signal,stage,phase,time_ms,voltage_V\n");

        rep = 1;
        signals();
        rep = 2;
        signals();
        rep = 3;
        signals();
    } finally {
        brick.motor(M3).powerOff();
        brick.motor(M4).powerOff();
    }
};
