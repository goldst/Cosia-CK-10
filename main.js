const context = new window.AudioContext;
const volume = context.createGain();
volume.connect(context.destination);

const notes = [
    'G0', 'Gs0', 'A0', 'As0', 'B0',
    'C1', 'Cs1', 'D1', 'Ds1', 'E1', 'F1', 'Fs1', 'G1', 'Gs1', 'A1', 'As1', 'B1',
    'C2', 'Cs2', 'D2', 'Ds2', 'E2', 'F2', 'Fs2', 'G2', 'Gs2', 'A2', 'As2', 'B2'
];
const buffers = {
    piano: {},
    fantasy: {},
    violin: {},
    flute: {}
};
const properties = {
    piano: {
        loopSample: false,
        fadeIn: 0,
        fadeOut: 0.25
    },
    fantasy: {
        loopSample: true,
        fadeIn: 0.15,
        fadeOut: 1
    },
    violin: {
        loopSample: true,
        fadeIn: 0.15,
        fadeOut: 0.25
    },
    flute: {
        loopSample: true,
        fadeIn: 0.15,
        fadeOut: 0.25
    }
};

const playingSources = [];
let currentInstrument = 'piano';
let currentNote = null;

function getSoundFile(name) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', `./sounds/${encodeURIComponent(name)}.flac`);
        request.responseType = 'arraybuffer';
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                resolve(request.response)
            }
        };
        request.send();
    });
}

async function setupBuffer(instrument, note) {
    const sample = await getSoundFile(`${instrument} ${note}`);
    try {
        return await context.decodeAudioData(sample);
    } catch (error) {
        console.log('error decoding sample:', sample);
        return;
    }
}

function playNoteAsync(instrument, note, time=context.currentTime, duration=undefined) {
    const source = context.createBufferSource();
    source.buffer = buffers[instrument][note];
    source.loop = properties[instrument].loopSample;

    const gain = context.createGain();

    gain.gain.linearRampToValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + properties[instrument].fadeIn);

    source.connect(gain);
    gain.connect(volume)

    if(duration) {
        fadeOut(instrument, gain, time + duration);
    }

    source.start(time);

    return [source, gain];
}

function playNote(instrument, note, time=0, duration=undefined) {
    while(playingSources.length > 0) {
        playingSources[0].stop();
        playingSources.shift();
    }

    let [source, gain] = playNoteAsync(instrument, note, time, duration);

    playingSources.push(source);

    return [source, gain];
}

function fadeOut(instrument, gain, time=context.currentTime) {
    gain.gain.linearRampToValueAtTime(gain.gain.value, time);
    gain.gain.linearRampToValueAtTime(0, time + properties[instrument].fadeOut);
}

function playScore(notes, speed, offset) {
    const startTime = context.currentTime;
    notes.forEach(note => playNoteAsync(note[0], note[1], startTime + speed * (offset + note[2]), speed * note[3]));
}

function demo() {
    playScore([
        ['piano', 'C1', -0.25,  0.25],
        ['piano', 'F1',  0.0,   0.25],
        ['piano', 'F1',  0.25,  0.25],
        ['piano', 'G1',  0.5,   0.25],
        ['piano', 'G1',  0.75,  0.25],
        ['piano', 'A1',  1,     0.375],
        ['piano', 'As1', 1.375, 0.125],
        ['piano', 'C2',  1.5,   0.25],
        ['piano', 'As1', 1.75,  0.25],
        ['piano', 'A1',  2,     0.25],
        ['piano', 'A1',  2.25,  0.25],
        ['piano', 'G1',  2.5,   0.25],
        ['piano', 'G1',  2.75,  0.25],
        ['piano', 'F1',  3,     0.75],

        ['piano', 'C1',  3.75,  0.25],
        ['piano', 'F1',  4.0,   0.25],
        ['piano', 'F1',  4.25,  0.25],
        ['piano', 'G1',  4.5,   0.25],
        ['piano', 'G1',  4.75,  0.25],
        ['piano', 'A1',  5,     0.375],
        ['piano', 'As1', 5.375, 0.125],
        ['piano', 'C2',  5.5,   0.25],
        ['piano', 'As1', 5.75,  0.25],
        ['piano', 'A1',  6,     0.25],
        ['piano', 'A1',  6.25,  0.25],
        ['piano', 'G1',  6.5,   0.25],
        ['piano', 'G1',  6.75,  0.25],
        ['piano', 'F1',  7,     0.75],

        ['fantasy', 'C2',  7.75,  0.125],
        ['fantasy', 'As1', 7.875, 0.125],
        ['fantasy', 'A1',  8,     0.25],
        ['fantasy', 'A1',  8.25,  0.25],
        ['fantasy', 'A1',  8.5,   0.25],
        ['violin', 'As1', 8.75,  0.125],
        ['violin', 'A1',  8.875, 0.125],
        ['violin', 'G1',  9,     0.25],
        ['violin', 'G1',  9.25,  0.25],
        ['violin', 'G1',  9.5,   0.25],

        ['fantasy', 'C2',   9.75,  0.125],
        ['fantasy', 'As1',  9.875, 0.125],
        ['fantasy', 'A1',  10,     0.25],
        ['fantasy', 'A1',  10.25,  0.25],
        ['fantasy', 'A1',  10.5,   0.25],
        ['violin', 'As1', 10.75,  0.125],
        ['violin', 'A1',  10.875, 0.125],
        ['violin', 'G1',  11,     0.25],
        ['violin', 'G1',  11.25,  0.25],
        ['violin', 'G1',  11.5,   0.25],

        ['piano', 'C2', 11.75, 0.25],
        ['piano', 'A1', 12,    0.25],
        ['piano', 'F1', 12.25, 0.25],
        ['piano', 'G1', 12.5,  0.25],
        ['piano', 'G1', 12.75, 0.25],
        ['piano', 'F1', 13,    0.75],

        ['fantasy', 'C1',  13.75,  0.25],
        ['fantasy', 'F1',  14.0,   0.25],
        ['fantasy', 'F1',  14.25,  0.25],
        ['fantasy', 'G1',  14.5,   0.25],
        ['fantasy', 'G1',  14.75,  0.25],
        ['fantasy', 'A1',  15,     0.375],
        ['fantasy', 'As1', 15.375, 0.125],
        ['fantasy', 'C2',  15.5,   0.25],
        ['fantasy', 'As1', 15.75,  0.25],
        ['fantasy', 'A1',  16,     0.25],
        ['fantasy', 'A1',  16.25,  0.25],
        ['fantasy', 'G1',  16.5,   0.25],
        ['fantasy', 'G1',  16.75,  0.25],
        ['fantasy', 'F1',  17,     0.75],

        ['fantasy', 'C1',  17.75,  0.25],
        ['fantasy', 'F1',  18.0,   0.25],
        ['fantasy', 'F1',  18.25,  0.25],
        ['fantasy', 'G1',  18.5,   0.25],
        ['fantasy', 'G1',  18.75,  0.25],
        ['fantasy', 'A1',  19,     0.375],
        ['fantasy', 'As1', 19.375, 0.125],
        ['fantasy', 'C2',  19.5,   0.25],
        ['fantasy', 'As1', 19.75,  0.25],
        ['fantasy', 'A1',  20,     0.25],
        ['fantasy', 'A1',  20.25,  0.25],
        ['fantasy', 'G1',  20.5,   0.25],
        ['fantasy', 'G1',  20.75,  0.25],
        ['fantasy', 'F1',  21,     0.75],

        ['violin', 'C2',  21.75,  0.125],
        ['violin', 'As1', 21.875, 0.125],
        ['violin', 'A1',  22,     0.25],
        ['violin', 'A1',  22.25,  0.25],
        ['violin', 'A1',  22.5,   0.25],
        ['flute', 'As1', 22.75,  0.125],
        ['flute', 'A1',  22.875, 0.125],
        ['flute', 'G1',  23,     0.25],
        ['flute', 'G1',  23.25,  0.25],
        ['flute', 'G1',  23.5,   0.25],

        ['violin', 'C2',  23.75,  0.125],
        ['violin', 'As1', 23.875, 0.125],
        ['violin', 'A1',  24,     0.25],
        ['violin', 'A1',  24.25,  0.25],
        ['violin', 'A1',  24.5,   0.25],
        ['flute', 'As1',  24.75,  0.125],
        ['flute', 'A1',   24.875, 0.125],
        ['flute', 'G1',   25,     0.25],
        ['flute', 'G1',   25.25,  0.25],
        ['flute', 'G1',   25.5,   0.25],

        ['fantasy', 'C2', 25.75, 0.25],
        ['fantasy', 'A1', 26,    0.25],
        ['fantasy', 'F1', 26.25, 0.25],
        ['fantasy', 'G1', 26.5,  0.25],
        ['fantasy', 'G1', 26.75, 0.25],
        ['fantasy', 'F1', 27,    0.75],

        ['violin', 'C1',  27.75,  0.25],
        ['violin', 'F1',  28.0,   0.25],
        ['violin', 'F1',  28.25,  0.25],
        ['violin', 'G1',  28.5,   0.25],
        ['violin', 'G1',  28.75,  0.25],
        ['violin', 'A1',  29,     0.375],
        ['violin', 'As1', 29.375, 0.125],
        ['violin', 'C2',  29.5,   0.25],
        ['violin', 'As1', 29.75,  0.25],
        ['violin', 'A1',  30,     0.25],
        ['violin', 'A1',  30.25,  0.25],
        ['violin', 'G1',  30.5,   0.25],
        ['violin', 'G1',  30.75,  0.25],
        ['violin', 'F1',  31,     0.75],

        ['violin', 'C1',  31.75,  0.25],
        ['violin', 'F1',  32.0,   0.25],
        ['violin', 'F1',  32.25,  0.25],
        ['violin', 'G1',  32.5,   0.25],
        ['violin', 'G1',  32.75,  0.25],
        ['violin', 'A1',  33,     0.375],
        ['violin', 'As1', 33.375, 0.125],
        ['violin', 'C2',  33.5,   0.25],
        ['violin', 'As1', 33.75,  0.25],
        ['violin', 'A1',  34,     0.25],
        ['violin', 'A1',  34.25,  0.25],
        ['violin', 'G1',  34.5,   0.25],
        ['violin', 'G1',  34.75,  0.25],
        ['violin', 'F1',  35,     0.75],

        ['flute', 'C2',  35.75,  0.125],
        ['flute', 'As1', 35.875, 0.125],
        ['flute', 'A1',  36,     0.25],
        ['flute', 'A1',  36.25,  0.25],
        ['flute', 'A1',  36.5,   0.25],
        ['piano', 'As0', 36.75,  0.125],
        ['piano', 'A0',  36.875, 0.125],
        ['piano', 'G0',  37,     0.25],
        ['piano', 'G0',  37.25,  0.25],
        ['piano', 'G0',  37.5,   0.25],

        ['flute', 'C2',  37.75,  0.125],
        ['flute', 'As1', 37.875, 0.125],
        ['flute', 'A1',  38,     0.25],
        ['flute', 'A1',  38.25,  0.25],
        ['flute', 'A1',  38.5,   0.25],
        ['piano', 'As0', 38.75,  0.125],
        ['piano', 'A0',  38.875, 0.125],
        ['piano', 'G0',  39,     0.25],
        ['piano', 'G0',  39.25,  0.25],
        ['piano', 'G0',  39.5,   0.25],

        ['violin', 'C2', 39.75, 0.25],
        ['violin', 'A1', 40,    0.25],
        ['violin', 'F1', 40.25, 0.25],
        ['violin', 'G1', 40.5,  0.25],
        ['violin', 'G1', 40.75, 0.25],
        ['violin', 'F1', 41,    0.75],

        ['flute', 'C1',  41.75,  0.25],
        ['flute', 'F1',  42.0,   0.25],
        ['flute', 'F1',  42.25,  0.25],
        ['flute', 'G1',  42.5,   0.25],
        ['flute', 'G1',  42.75,  0.25],
        ['flute', 'A1',  43,     0.375],
        ['flute', 'As1', 43.375, 0.125],
        ['flute', 'C2',  43.5,   0.25],
        ['flute', 'As1', 43.75,  0.25],
        ['flute', 'A1',  44,     0.25],
        ['flute', 'A1',  44.25,  0.25],
        ['flute', 'G1',  44.5,   0.25],
        ['flute', 'G1',  44.75,  0.25],
        ['flute', 'F1',  45,     0.75],

        ['flute', 'C1',  45.75,  0.25],
        ['flute', 'F1',  46.0,   0.25],
        ['flute', 'F1',  46.25,  0.25],
        ['flute', 'G1',  46.5,   0.25],
        ['flute', 'G1',  46.75,  0.25],
        ['flute', 'A1',  47,     0.375],
        ['flute', 'As1', 47.375, 0.125],
        ['flute', 'C2',  47.5,   0.25],
        ['flute', 'As1', 47.75,  0.25],
        ['flute', 'A1',  48,     0.25],
        ['flute', 'A1',  48.25,  0.25],
        ['flute', 'G1',  48.5,   0.25],
        ['flute', 'G1',  48.75,  0.25],
        ['flute', 'F1',  49,     0.75],

        ['piano', 'C2',  49.75,  0.125],
        ['piano', 'As1', 49.875, 0.125],
        ['piano', 'A1',  50,     0.25],
        ['piano', 'A1',  50.25,  0.25],
        ['piano', 'A1',  50.5,   0.25],
        ['piano', 'As0', 50.75,  0.125],
        ['piano', 'A0',  50.875, 0.125],
        ['piano', 'G0',  51,     0.25],
        ['piano', 'G0',  51.25,  0.25],
        ['piano', 'G0',  51.5,   0.25],

        ['piano', 'C2',  51.75,  0.125],
        ['piano', 'As1', 51.875, 0.125],
        ['piano', 'A1',  52,     0.25],
        ['piano', 'A1',  52.25,  0.25],
        ['piano', 'A1',  52.5,   0.25],
        ['piano', 'As0', 52.75,  0.125],
        ['piano', 'A0',  52.875, 0.125],
        ['piano', 'G0',  53,     0.25],
        ['piano', 'G0',  53.25,  0.25],
        ['piano', 'G0',  53.5,   0.25],

        ['flute', 'C2', 53.75, 0.25],
        ['flute', 'A1', 54,    0.25],
        ['flute', 'F1', 54.25, 0.25],
        ['flute', 'G1', 54.5,  0.25],
        ['flute', 'G1', 54.75, 0.25],
        ['flute', 'F1', 55,    0.75],
    ], 1.6, 0.25);
}

let lastGain = 0;


function getButton(e) {
    let coordinates = [
        e.touches[0].pageX,
        e.touches[0].pageY
    ];
    return document.elementFromPoint(...coordinates);
}

let currentButton;

async function setupSoundEvents(instrument, note, buffer) {
    buffers[instrument][note] = buffer;

    const button = document.getElementsByClassName(note)[0];
    button.note = note;

    function down() {
        let [sound, gain] = playNote(currentInstrument, note);
        lastGain = gain;
        currentNote = note;
        currentButton = button
    }

    function up() {
        fadeOut(currentInstrument, lastGain);
        currentNote = null;
    }
    
    button.addEventListener('mouseover', () => { if(currentNote){ down() } });
    button.addEventListener('touchmove', e => {
        if(currentNote){ 
            currentButton = getButton(e);

            if(currentNote !== currentButton.note) {
                currentButton.dispatchEvent(new Event('mouseover'));
            }
        }
    });

    button.addEventListener('mousedown', down);
    button.addEventListener('touchstart', e => { down(); e.preventDefault(); })

    button.addEventListener('mouseup', up);
    button.addEventListener('touchend', () => {
        if(currentButton) {
            currentButton.dispatchEvent(new Event('mouseup'));
        }
    });
}

async function setupSound(instrument, note) {
    buffer = await setupBuffer(instrument, note);
    return await setupSoundEvents(instrument, note, buffer);
}

function setInstrument(n) {
    switch (n) {
        case 0:
            currentInstrument = 'piano';
            break;
        case 1:
            currentInstrument = 'fantasy';
            break;
        case 2:
            currentInstrument = 'violin';
            break;
        default:
            currentInstrument = 'flute';
            break;
    }
}

window.addEventListener('load', () => {
    const setupProcedures = 
        Object.keys(buffers).map(instrument =>
            notes.map(note => new Promise((resolve, reject) =>
                setupSound(instrument, note).then(resolve)
            ))
        );
    
    Promise.all(setupProcedures).then(() => {
        document.getElementsByClassName('loading')[0].classList.add(['loaded']);
    });
    
    document.addEventListener('mouseup', () => currentNote = false);

    document.getElementsByClassName('demo')[0].addEventListener('mousedown', demo)

    const volumeSlider = document.getElementsByClassName('volume-slider')[0];
    volume.gain = volumeSlider.value / 255.0;

    volumeSlider.addEventListener('change', () => {
        volume.gain.value = volumeSlider.value / 255.0;
    });

    const toneSlider = document.getElementsByClassName('tone-slider')[0];
    setInstrument(parseInt(toneSlider.value));

    toneSlider.addEventListener('change', () => 
        setInstrument(parseInt(toneSlider.value))
    );
});

