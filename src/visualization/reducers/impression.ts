import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (let impression of action.payload) {
                if (impression.events && impression.events.length > 0) {
                    return impression;
                }
            }
            return sort(action.payload[0]);
        case Types.SelectImpression:
            return perceivedTime(sort(action.payload));
    }
    return state;
}


function sort(impression) {
    if (impression && impression.events && impression.events.length > 0) {
        impression.events = impression.events.sort(function(a, b) {
            return a.time === b.time ? a.id - b.id : a.time - b.time;
        });
    }
    return impression;
}

function perceivedTime(impression){
    
        var startTime = 0;
        var settleTime = 2000;
        var mindWidth = 50;
        var minHeight = 50;
       
        
        var index = 0;
        var lastTime = startTime;
        
        var settleTimeFound = "0";
        
        
        for(var evt of impression.events) {
            if(evt.type === "Layout" && evt.state.tag === "IMG" && 
            evt.state.layout.width >= mindWidth && evt.state.layout.height >= minHeight){
                if((evt.time - lastTime) > settleTime){
                    break;
                }
                lastTime = evt.time;
            }else{
                continue;
            }
 
        }

        console.log("LAST TIME", lastTime);

        for (var evt of impression.events) {
            
            if(evt.type === "Layout" && evt.state.tag === "IMG" && 
                evt.state.layout.width >= mindWidth && evt.state.layout.height >= minHeight && evt.time <= lastTime ){
                   
                    evt["state"]["isPerceivedEvent"] = true;
                
            } else{
                evt["state"]["isPerceivedEvent"] = false;
            }

        }
    return(impression)
}