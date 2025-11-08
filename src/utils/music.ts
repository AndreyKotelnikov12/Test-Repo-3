import React from 'react';

interface MusicController {
  init: () => void;
  start: () => void;
  stop: () => void;
  resume: () => void;
}

const musicController = ((): MusicController => {
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let sequenceTimeout: number | null = null;
  let isPlaying = false;

  const FREQUENCIES: { [key: string]: number } = {
    'A2': 110.00, 'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
    'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00,
  };

  const BEAT_DURATION = 0.5;

  const melody: { note: string, beats: number }[] = [
    { note: 'A3', beats: 4 }, { note: 'E3', beats: 4 }, { note: 'D3', beats: 4 }, { note: 'A2', beats: 4 },
    { note: 'C3', beats: 2 }, { note: 'D3', beats: 2 }, { note: 'E3', beats: 4 }, { note: 'REST', beats: 4 },
    { note: 'F3', beats: 4 }, { note: 'C4', beats: 4 }, { note: 'B3', beats: 4 }, { note: 'G3', beats: 4 },
    { note: 'A3', beats: 2 }, { note: 'B3', beats: 2 }, { note: 'C4', beats: 4 }, { note: 'REST', beats: 4 },
    { note: 'E4', beats: 3 }, { note: 'D4', beats: 1 }, { note: 'C4', beats: 4 }, { note: 'A3', beats: 4 }, { note: 'G3', beats: 4 },
    { note: 'F3', beats: 4 }, { note: 'G3', beats: 4 }, { note: 'A3', beats: 8 },
    { note: 'D4', beats: 2 }, { note: 'C4', beats: 2 }, { note: 'B3', beats: 2 }, { note: 'A3', beats: 2 },
    { note: 'G3', beats: 4 }, { note: 'A3', beats: 4 }, { note: 'E3', beats: 4 }, { note: 'A2', beats: 4 },
    { note: 'C3', beats: 4 }, { note: 'G3', beats: 4 }, { note: 'A3', beats: 4 }, { note: 'REST', beats: 4 },
  ];

  const playSequence = (noteIndex = 0) => {
    if (!audioContext || !oscillator || !gainNode || !isPlaying) return;

    const currentEvent = melody[noteIndex % melody.length];
    const noteFrequency = FREQUENCIES[currentEvent.note] || 0;
    const noteDuration = currentEvent.beats * BEAT_DURATION;
    const now = audioContext.currentTime;

    if (noteFrequency > 0) {
      oscillator.frequency.setValueAtTime(noteFrequency, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gainNode.gain.setValueAtTime(0.1, now + noteDuration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + noteDuration);
    }

    sequenceTimeout = window.setTimeout(() => {
      playSequence(noteIndex + 1);
    }, noteDuration * 1000);
  };

  const init = () => {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
  };
  
  const start = () => {
    init();
    if (!audioContext || isPlaying) return;
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    isPlaying = true;

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.detune.value = 5;

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    oscillator.start();
    playSequence();
  };

  const stop = () => {
    if (!audioContext) return;
    if (!isPlaying) {
      if (audioContext.state === 'running') {
        // Prevent stopping if already stopped, but allow context suspend
        // audioContext.suspend(); 
      }
      return;
    }
    
    isPlaying = false;
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
    
    if (gainNode) {
      const now = audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

      window.setTimeout(() => {
        if (oscillator) {
          oscillator.stop();
          oscillator.disconnect();
        }
        if (gainNode) {
          gainNode.disconnect();
        }
        oscillator = null;
        gainNode = null;
      }, 500);
    }
  };
  
  const resume = () => {
      if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
      }
  }

  return { init, start, stop, resume };
})();

export default musicController;

let attackAudioContext: AudioContext | null = null;
export const playAttackSound = () => {
    if (!attackAudioContext) {
        try {
            attackAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported");
            return;
        }
    }

    if (attackAudioContext.state === 'suspended') {
        attackAudioContext.resume();
    }
    
    const now = attackAudioContext.currentTime;
    const gainNode = attackAudioContext.createGain();
    gainNode.connect(attackAudioContext.destination);

    const bufferSize = attackAudioContext.sampleRate * 0.1;
    const buffer = attackAudioContext.createBuffer(1, bufferSize, attackAudioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = attackAudioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = attackAudioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 1;

    noiseSource.connect(filter);
    filter.connect(gainNode);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    noiseSource.start(now);
    noiseSource.stop(now + 0.1);
};


export const mapMusicController = ((): MusicController => {
    let audioContext: AudioContext | null = null;
    let isPlaying = false;
    let nodes: AudioNode[] = [];
    let loopTimeout: number | null = null;

    const FREQUENCIES: { [key: string]: number } = {
        'C2': 65.41, 'Eb2': 77.78, 'G2': 98.00,
        'C3': 130.81, 'Eb3': 155.56, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'Bb3': 233.08,
    };
    
    const DURATION = 60; // 1 minute loop

    const playNote = (freq: number, time: number, duration: number, gain: number, type: OscillatorType = 'sine') => {
        if (!audioContext) return;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        
        filter.type = 'lowpass';
        filter.frequency.value = type === 'sine' ? 2000 : 800;

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(gain, time + duration * 0.1);
        gainNode.gain.setValueAtTime(gain, time + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
        nodes.push(osc, gainNode, filter);
    };

    const eventQueue: { time: number; note: string; duration: number; gain: number; type: OscillatorType }[] = [
        // Drone
        { time: 0, note: 'C2', duration: DURATION, gain: 0.35, type: 'sine' },

        // Melody
        { time: 4, note: 'G3', duration: 6, gain: 0.5, type: 'triangle' },
        { time: 12, note: 'Eb3', duration: 8, gain: 0.5, type: 'triangle' },
        { time: 22, note: 'F3', duration: 5, gain: 0.45, type: 'triangle' },
        { time: 28, note: 'C3', duration: 7, gain: 0.5, type: 'triangle' },
        { time: 38, note: 'Ab3', duration: 6, gain: 0.4, type: 'sawtooth' },
        { time: 46, note: 'Bb3', duration: 4, gain: 0.45, type: 'triangle' },
        { time: 52, note: 'G3', duration: 7, gain: 0.5, type: 'triangle' },
    ];


    const scheduleMusic = () => {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        stopAllNodes();

        eventQueue.forEach(event => {
            const freq = FREQUENCIES[event.note];
            if (freq) {
                playNote(freq, now + event.time, event.duration, event.gain, event.type);
            }
        });

        loopTimeout = window.setTimeout(scheduleMusic, DURATION * 1000);
    };

    const init = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { console.error("Web Audio API not supported"); }
        }
    };
    
    const stopAllNodes = () => {
        nodes.forEach(node => {
            try {
                 if (node instanceof OscillatorNode) node.stop(0);
            } catch (e) {}
            node.disconnect();
        });
        nodes = [];
    }

    const start = () => {
        init();
        if (!audioContext || isPlaying) return;
        if (audioContext.state === 'suspended') audioContext.resume();
        isPlaying = true;

        if (loopTimeout) clearTimeout(loopTimeout);
        scheduleMusic();
    };

    const stop = () => {
        if (!audioContext || !isPlaying) return;
        isPlaying = false;
        if (loopTimeout) clearTimeout(loopTimeout);
        loopTimeout = null;
        stopAllNodes();
    };
    
    const resume = () => {
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    };

    return { init, start, stop, resume };
})();

// --- New Music Controllers for Victory and Defeat ---

const createSimpleJingleController = (melody: { note: string, beats: number }[], beatDuration: number): MusicController => {
    let audioContext: AudioContext | null = null;
    let isPlaying = false;
    let sequenceTimeout: number | null = null;
    let nodes: AudioNode[] = [];

    const FREQUENCIES: { [key: string]: number } = {
        'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'E5': 659.25,
    };
    
    const stopAllNodes = () => {
        nodes.forEach(node => {
            try {
                if (node instanceof OscillatorNode) node.stop(0);
            } catch (e) {}
            node.disconnect();
        });
        nodes = [];
    };

    const playSequence = (index = 0) => {
        if (!audioContext || !isPlaying || index >= melody.length) {
            if (index >= melody.length) stop();
            return;
        }
        
        const now = audioContext.currentTime;
        const event = melody[index];
        const freq = FREQUENCIES[event.note];
        
        if (freq) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (event.beats * beatDuration));
            osc.start(now);
            osc.stop(now + (event.beats * beatDuration));
            nodes.push(osc, gain);
        }

        sequenceTimeout = window.setTimeout(() => playSequence(index + 1), event.beats * beatDuration * 1000);
    };

    const init = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { console.error("Web Audio API not supported"); }
        }
    };

    const start = () => {
        init();
        if (!audioContext || isPlaying) return;
        if (audioContext.state === 'suspended') audioContext.resume();
        isPlaying = true;
        stopAllNodes();
        playSequence();
    };

    const stop = () => {
        if (!audioContext || !isPlaying) return;
        isPlaying = false;
        if (sequenceTimeout) clearTimeout(sequenceTimeout);
        sequenceTimeout = null;
        stopAllNodes();
    };
    
    const resume = () => {
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    };

    return { init, start, stop, resume };
};

export const victoryMusicController = createSimpleJingleController([
    { note: 'C4', beats: 1 }, { note: 'E4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'C5', beats: 2.5 },
], 0.2);

export const defeatMusicController = createSimpleJingleController([
    { note: 'A3', beats: 1.5 }, { note: 'G3', beats: 1.5 }, { note: 'F3', beats: 1.5 }, { note: 'E3', beats: 3 },
], 0.5);

export const introMusicController = createSimpleJingleController([
    { note: 'C4', beats: 2 }, { note: 'G4', beats: 2 }, { note: 'E4', beats: 2 }, { note: 'A4', beats: 2 },
    { note: 'F4', beats: 3 }, { note: 'C4', beats: 1 }, { note: 'G4', beats: 4 },
    { note: 'C5', beats: 2 }, { note: 'B4', beats: 2 }, { note: 'A4', beats: 2 }, { note: 'G4', beats: 2 },
    { note: 'F4', beats: 3 }, { note: 'E4', beats: 1 }, { note: 'D4', beats: 4 },
], 0.35);

export const questCompleteMusicController = createSimpleJingleController([
    { note: 'G4', beats: 1 }, { note: 'A4', beats: 1 }, { note: 'B4', beats: 1 }, { note: 'C5', beats: 1.5 }, { note: 'E5', beats: 2.5 }
], 0.18);