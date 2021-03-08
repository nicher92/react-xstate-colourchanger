import { MachineConfig, actions, Action, assign } from "xstate";
//import { cancel } from "xstate/lib/actionTypes";

const {send, cancel} = actions;


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function promptAndAsk(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
            initial: "prompt",
            states: {
                prompt: {
                    entry: say(prompt),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: [send("LISTEN"), send("MAXSPEECH", {delay: 5000, id: "maxsp"})]
                },
                nomatch: {
                    entry: say("Sorry I cant find what you are looking for"),
                    on: { ENDSPEECH: "prompt" }
                },
            }})
    }


function giveInformation (information: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
            initial: information,
            states: {
                names: {
                    entry: say("These are the people available, Tommy, Marina, Saga and John"),
                },
                
                days: { 
                    entry: say("These are the days available, Friday, Thursday and Wednesday"),
                },
                times: { 
                    entry: say("These are the times available, seven o clock, eight o clock, nine o clock and ten o clock"),
                },
            }})
    }
 

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
    "Tommy": { person: "Tommy Hertzberg" },
    "Marina": { person: "Marina Noren" },
    "Saga": { person: "Saga Nilsson" },
    "John": { person: "John Appleseed" },
    "Jon": { person: "John Appleseed" },
    "on Friday": { day: "Friday" },
    "Friday": { day: "Friday" },
    "Thursday": { day: "Thursday" },
    "on Thursday": { day: "Thursday" },
    "Wednesday": { day: "Wednesday" },
    "on Wednesday": { day: "Wednesday" },
    "at nine": { time: "9" },
    "nine": { time: "9" },
    "nine o clock": { time: "9" },
    "seven": { time: "7" },
    "seven o clock": { time: "7" },
    "at eight": { time: "8" },
    "eight": { time: "8" },
    "eight o clock": { time: "8" },
    "at ten": { time: "10" },
    "tenn": {time: "10" },
    "ten o clock": { time: "10" },
    "ten": {time: "10" },
}


const yesOrNoGrammar: { [index: string]: { tru?: string, fal?: string } } = {
    "ya": { tru: "yes" },
    "ja": { tru: "yes" },
    "yes": { tru: "yes" },
    "yeah": { tru: "yes" },
    "ya": { tru: "yes" },
    "ok": { tru: "yes" },
    "okay": { tru: "yes" },
    "sure": { tru: "yes" },
    "no": { fal: "no" },
    "nope": { fal: "no" },
    "nah": { fal: "no" },
    "no way": { fal: "no" },
    "nej": { fal: "no" },
}


const goBackGrammar: { [index: string]: { goback?: string } } = {
    "Go back": { goback: "go back" },
    "previous": { goback: "go back" },
    "previous stage": { goback: "go back" },
    "back": { goback: "go back" },
    "back up": { goback: "go back" },
    "return": { goback: "go back" },
    
}

const truthOrFalse = {
    cond: (context) => "tru" in (yesOrNoGrammar[context.recResult] || {}),
    actions: assign((context) => { return { tru: yesOrNoGrammar[context.recResult].tru } }),
    target: "#root.dm.endstate",
    cond: (context) => "fal" in (yesOrNoGrammar[context.recResult] || {}),
    actions: assign((context) => { return { fal: yesOrNoGrammar[context.recResult].fal } }),
    target:  "#root.dm.init"  
}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://meeting-maker.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://localhost:3000/react-xstate-colourchanger' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());
        

const sayInput: Action<SDSContext, SDSEvent> = send((context: SDSContext) => ({
    type: "SPEAK", value: `${context.Input}`
}))



const increment = assign({
    count: (context) => context.count + 1
  });

function maxCount(context, event) {
    return context.count > 3;
  }


const sayValue: Action<SDSContext, SDSEvent> = send((context: SDSContext) => ({
    type: "SPEAK", value: `${context.count}`
}))




export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    context: { count: 0 },
    initial: 'init',
    states: {
        init: {
            on: { 
                CLICK: "topstate"   
            },
        },
        topstate: {
            initial: 'askUser',
            on: {
                RECOGNISED:
                {
                    target: '#root.dm.help',
                    actions: cancel("maxsp"), 
                    cond: (context) => context.recResult === 'help'
                },
                MAXSPEECH: {
                    actions: [ 
                    (context) => console.log(`${context.count}`),
                    increment,
                    (context) => console.log(`${context.count}`),
                    ],
                    target: "maxspeech"
            },
            },
            
        
            states: {
                hist: { type: 'history', history: 'shallow' },
            askUser: {
                on: { 
                    RECOGNISED: {
                    target: "query",
                    actions: assign((context) => { return { query: context.recResult } } ),
                    cond: (context) => !(context.recResult === "help")
                  },
                },
            ...promptAndAsk("what would you like to do?")
            },
            query: {
                invoke: {
                    id: "NLU",
                    src: (context, event) => nluRequest(context.query),
                    onDone: {
                        target: "middlestate",
                        actions: [assign((context, event) => { return {Input: event.data.intent.name }}),
                                (context:SDSContext, event:any) => sayInput || {}],
                    },
                    onError: {
                        target: "#root.dm.init",
                        actions: (context, event) => console.log(event.data),
                    }
                  },
                },

        
        
        middlestate: {
            always: [
                { target: "timer", cond: (context, event) => context.Input === "timer" },
                { target: "appointment", cond: (context, event) => context.Input === "appointment" },
                { target:  "todo", cond: (context, event) => context.Input === "to do"},
                { target: "nomatch" }]
        },
        
        nomatch: {
            on: { ENDSPEECH: "askUser" },
            entry: say("sorry, that option is not available, please try again")
            },
        
        todo: {
            on: { ENDSPEECH: "#root.dm.init" },
            entry: say("welcome to the to do state")
        },
        
        timer: {
            on: { ENDSPEECH: "#root.dm.init" },
            entry: say("welcome to the timer state")
        },
        
        appointment: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },
        
        
        who: {
            initial: "one",
            on: {
                RECOGNISED: [
                    { 
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"},
                    { cond: (context) => "goback" in (goBackGrammar[context.recResult] || {}),
                    actions: assign((context) => { return { goback: goBackGrammar[context.recResult].goback } }),
                    target:  "askUser" },
                    { target: ".nomatch", cond: (context) => !(context.recResult === "help")}, 
                ]},
            states: {
                one: {
                    ...giveInformation("names"),
                on: { ENDSPEECH: "two" }
            },
                two: { ...promptAndAsk("Who are you meeting with")

                },
                nomatch: {
                    entry: say("Sorry, that person is not available"),
                    on: { ENDSPEECH: "one" }
                },
            }, 
        },
        
        day: {
            initial: "prompt",
            on: { ENDSPEECH: "listener" },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK, you want to meet ${context.person}`
                        }))
                        },
                    },
                }, 
                
        listener: {
                initial: "one",
                on : { 
                    RECOGNISED: [
                       { cond: (context) => "day" in (grammar[context.recResult] || {}),
                        actions: assign((context) => { return { day: grammar[context.recResult].day } }), 
                        target: "question" },
                        { cond: (context) => "goback" in (goBackGrammar[context.recResult] || {}),
                        actions: assign((context) => { return { goback: goBackGrammar[context.recResult].goback } }),
                        target:  "who" },
                        { target: ".nomatch", cond: (context) => !(context.recResult === "help")},
                    ]}, 
                states: {
                one: {
                    ...giveInformation("days"),
                on: { ENDSPEECH: "two" }
                    },
                two: { ...promptAndAsk("On which day is your meeting"),
                        },
                nomatch: {
                    entry: say("Sorry, that day is not available"),
                    on: { ENDSPEECH: "one" }
                },
                    }, 
                },
                        

            
        question: {
            initial: "first", 
            on: { RECOGNISED: [
                            { cond: (context) => "tru" in (yesOrNoGrammar[context.recResult] || {}),
                            actions: assign((context) => { return { tru: yesOrNoGrammar[context.recResult].tru } }),
                            target: "wholeDayFinal" },
                            { cond: (context) => "fal" in (yesOrNoGrammar[context.recResult] || {}),
                            actions: assign((context) => { return { fal: yesOrNoGrammar[context.recResult].fal } }),
                            target:  "partDay" },
                            { target: ".nomatch", cond: (context) => !(context.recResult === "help") },
                        ]},
            states: {
                        first: {
                            entry: say("will the appointment take the entire day"),
                        on: {ENDSPEECH: "ask" },
                        },
                        
                        ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Please repeat yourself"),
                    on: { ENDSPEECH: "first" }
                },
                }, 
            },
    
    
    
                
          partDay: {
                initial: "one", 
                on : { 
                    RECOGNISED: [            
                        {cond: (context) => "time" in (grammar[context.recResult] || {}),
                        actions: assign((context) => { return { time: grammar[context.recResult].time } }), 
                        target: "partDayFinal" },
                        { cond: (context) => "goback" in (goBackGrammar[context.recResult] || {}),
                        actions: assign((context) => { return { goback: goBackGrammar[context.recResult].goback } }),
                        target:  "question" },
                        { target: ".nomatch", cond: (context) => !(context.recResult === "help") }, ]},
                states: {
                        one: {
                            ...giveInformation("times"),
                            on: { ENDSPEECH: "two" }
                        },
                        two: { ...promptAndAsk("At what time is your meeting?"),
                            },
                nomatch: {
                    entry: say("Please repeat yourself"),
                    on: { ENDSPEECH: "one" }
                    },
                }, 
            },

                
        wholeDayFinal: {
                initial: "first", 
                    on: { 
                        RECOGNISED: 
                                [{
                                cond: (context) => "tru" in (yesOrNoGrammar[context.recResult] || {}),
                                actions: assign((context) => { return { tru: yesOrNoGrammar[context.recResult].tru } }),
                                target: "#root.dm.endstate"
                                },
                                
                                { cond: (context) => "goback" in (goBackGrammar[context.recResult] || {}),
                                  actions: assign((context) => { return { goback: goBackGrammar[context.recResult].goback } }),
                                  target:  "question" },
                        
                                {
                                cond: (context) => "fal" in (yesOrNoGrammar[context.recResult] || {}),
                                actions: assign((context) => { return { fal: yesOrNoGrammar[context.recResult].fal } }),
                                target:  "#root.dm.init"  
                                },
                                { target: ".nomatch", cond: (context) => !(context.recResult === "help") },],
                        },
                    
                    states: {
                        first: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK, you want to meet ${context.person} on ${context.day} the entire day`
                        })),
                        on: {ENDSPEECH: "ask" }
                        },
                        ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Please repeat yourself"),
                    on: { ENDSPEECH: "first" }
                },
                    }, 
                },

        partDayFinal:  {
                initial: "first", 
                    on: { 
                        RECOGNISED: 
                                [{
                                    cond: (context) => "tru" in (yesOrNoGrammar[context.recResult] || {}),
                                    actions: assign((context) => { return { tru: yesOrNoGrammar[context.recResult].tru } }),
                                    target: "#root.dm.endstate"
                                    },
                                
                                { cond: (context) => "goback" in (goBackGrammar[context.recResult] || {}),
                                  actions: assign((context) => { return { goback: goBackGrammar[context.recResult].goback } }),
                                  target:  "question" },
                        
                                {
                                cond: (context) => "fal" in (yesOrNoGrammar[context.recResult] || {}),
                                actions: assign((context) => { return { fal: yesOrNoGrammar[context.recResult].fal } }),
                                target:  "#root.dm.init"},
                                { target: ".nomatch", cond: (context) => !(context.recResult === "help") },]
                        
                        },
                    
                    states: {
                        first: {
                            entry: send((context) => ({
                                type: "SPEAK",
                                value: `OK, you want to meet ${context.person} on ${context.day} at ${context.time}`
                        })),
                        on: {ENDSPEECH: "ask" }
                        },
                        ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Please repeat yourself"),
                    on: { ENDSPEECH: "first" }
                },
                    }, 
                },
            },
        },
        help: {
            entry: say("sorry buddy, i will just send you back"),
            on: { 'ENDSPEECH': '#root.dm.topstate.hist' }
        },
        endstate: { 
            entry: say("your appointment has been created"),
            type: "final"
            },
        maxspeech: {
            on: {ENDSPEECH: "#root.dm.topstate.hist"},
            entry: say("whatever")
            //entry: say(`${context.count}`),
  //          entry: send((context) => ({
   //             type: "SPEAK",
   //             value: `${context.count}`
   //     })),
        },
        },
     //end topstate
   //end of all states
})

