/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    person: string,
    day: string,
    time: string,
    tru: string,
    fal: string,
    Input: string,
    query: string,
    goback: string,
    count: number,
    object: string,
    action: string,
    player: number,
    player2: number,
    Qnumber: number,

}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'MAXSPEECH' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string };
    
