const context = new window.AudioContext;
const volume = context.createGain();
volume.connect(context.destination);

const notes = [
    'G0', 'Gs0', 'A0', 'As0', 'B0',
    'C1', 'Cs1', 'D1', 'Ds1', 'E1', 'F1', 'Fs1', 'G1', 'Gs1', 'A1', 'As1', 'B1',
    'C2', 'Cs2', 'D2', 'Ds2', 'E2', 'F2', 'Fs2', 'G2', 'Gs2', 'A2', 'As2', 'B2'
];
const buffers = {
    piano: {}//,
    //fantasy: {},
    //violin: {},
    //flute: {}
};
const playingSources = [];

let currentNote = null;

function getSoundFile(name) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', encodeURIComponent(`./sounds/${name}.wav`), true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve(request.response);
            } else {
                console.log(request.statusText);
                reject(request.statusText);
            }
        };
        request.send();
    });
}

async function setupBuffer(instrument, note) {
    const sample = await getSoundFile(`${instrument} ${note}`);
    return await context.decodeAudioData(sample);
}

function playNoteAsync(instrument, note, time=0) {
    const source = context.createBufferSource();
    source.buffer = buffers[instrument][note];

    const gain = context.createGain();
    source.connect(gain);
    gain.connect(volume)

    source.start(time);

    return [source, gain];
}

function playNote(instrument, note, time=0) {
    while(playingSources.length > 0) {
        playingSources[0].stop();
        playingSources.shift();
    }

    let [source, gain] = playNoteAsync(instrument, note, time);

    playingSources.push(source);

    return [source, gain];
}

function fadeOut(instrument, gain) {
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.25);
}

function playScore(notes, speed, offset) {
    const startTime = context.currentTime;
    notes.forEach(note => playNoteAsync(note[0], note[1], startTime + speed * (offset + note[2])));
}

function demo() {
    playScore([
        ['piano', 'C1', -0.25],
        ['piano', 'F1',  0.0],
        ['piano', 'F1',  0.25],
        ['piano', 'G1',  0.5],
        ['piano', 'G1',  0.75],
        ['piano', 'A1',  1],
        ['piano', 'As1', 1.375],
        ['piano', 'C2',  1.5],
        ['piano', 'As1', 1.75],
        ['piano', 'A1',  2],
        ['piano', 'A1',  2.25],
        ['piano', 'G1',  2.5],
        ['piano', 'G1',  2.75],
        ['piano', 'F1',  3],

        ['piano', 'C1',  3.75],
        ['piano', 'F1',  4.0],
        ['piano', 'F1',  4.25],
        ['piano', 'G1',  4.5],
        ['piano', 'G1',  4.75],
        ['piano', 'A1',  5],
        ['piano', 'As1', 5.375],
        ['piano', 'C2',  5.5],
        ['piano', 'As1', 5.75],
        ['piano', 'A1',  6],
        ['piano', 'A1',  6.25],
        ['piano', 'G1',  6.5],
        ['piano', 'G1',  6.75],
        ['piano', 'F1',  7],

        ['piano', 'C2',  7.75],
        ['piano', 'As1', 7.875],
        ['piano', 'A1',  8],
        ['piano', 'A1',  8.25],
        ['piano', 'A1',  8.5],
        ['piano', 'As1', 8.75],
        ['piano', 'A1',  8.875],
        ['piano', 'G1',  9],
        ['piano', 'G1',  9.25],
        ['piano', 'G1',  9.5],

        ['piano', 'C2',   9.75],
        ['piano', 'As1',  9.875],
        ['piano', 'A1',  10],
        ['piano', 'A1',  10.25],
        ['piano', 'A1',  10.5],
        ['piano', 'As1', 10.75],
        ['piano', 'A1',  10.875],
        ['piano', 'G1',  11],
        ['piano', 'G1',  11.25],
        ['piano', 'G1',  11.5],

        ['piano', 'C2', 11.75],
        ['piano', 'A1', 12],
        ['piano', 'F1', 12.25],
        ['piano', 'G1', 12.5],
        ['piano', 'G1', 12.75],
        ['piano', 'F1', 13]
    ], 1.6, 3);
}

let lastGain = 0;
window.addEventListener('load', () => {
    Object.keys(buffers).forEach(instrument =>
        notes.forEach(note =>
            setupBuffer(instrument, note)
                .then(buffer => {
                    buffers.piano[note] = buffer;

                    document.addEventListener('mouseup', () => currentNote = false);

                    button = document.getElementsByClassName(note)[0];

                    button.note = note;

                    function down() {
                        let [sound, gain] = playNote(instrument, note);
                        lastGain = gain;
                        currentNote = note;
                    }
                    
                    button.addEventListener('mouseover', () => { if(currentNote){ down() } });
                    button.addEventListener('touchmove', e => {
                        if(currentNote){ 
                            let coordinates = [
                                e.touches[0].pageX,
                                e.touches[0].pageY
                            ];
                            const correctButton = document.elementFromPoint(...coordinates);

                            if(currentNote !== correctButton.note) {
                               correctButton.dispatchEvent(new Event('mouseover'));
                            }
                        }
                    });

                    button.addEventListener('mousedown', down);
                    button.addEventListener('touchstart', e => { down(); e.preventDefault(); })

                    button.addEventListener('mouseup', () => {
                        fadeOut(instrument, lastGain);
                    });
                })
        )
    );

    document.getElementsByClassName('demo')[0].addEventListener('mousedown', demo)

    const volumeSlider = document.getElementsByClassName('volume-slider')[0]
    volume.gain = volumeSlider.value / 255.0;

    volumeSlider.addEventListener('mouseup', ()=> {
        console.log(volumeSlider.value / 255);
        volume.gain.value = volumeSlider.value / 255.0;
        console.log(volume);
    });
});

