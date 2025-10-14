import { createSlice } from "@reduxjs/toolkit";

const connectionSlice=createSlice({
    name:"connection",
    initialState:null,
    reducers:{
        addConnection:(state,action)=>{action.payload;},
        removeConnection:()=>{ return null;
    },
},
});

export const {addConnectio, removeConnection}=connectionSlice.actions;

export default connectionSlice.reducer; 