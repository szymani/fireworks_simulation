class Firework{
    constructor(x,y,v0,angle,stage,time,r,g,b){
        this._xpos = x;
        this._ypos = y;
        this._angle = angle;
        this._stage = stage;        //1 - original firework, 2 - chain explosion, 3 - final stage
        this._vX = v0*Math.cos(this._angle);
        this._vY = v0*Math.sin(this._angle);
        this._rgb = [r,g,b];
        this._time = time;      
        if(stage==2)
            this._movingTime = (this.vY*0.03)/0.0001 + Math.random() * ( 150 - 30 ) + 30;
        else if(stage==3)
            this._movingTime = (this.vY*0.03)/0.0001 + Math.random() * ( 100 - 30 ) + 30;
        else
            this._movingTime = (this.vY*0.03)/0.0001 + 30;
        this._finishTime = this.time + this._movingTime;
    }
    get rgb() {
        return this._rgb;
    }
    get time() {
        return this._time;
      }
    set time(x) {
        this._time = x;
    }
    get movingTime() {
        return this._movingTime;
      }
    set movingTime(x) {
        this._movingTime = x;
    }
    get xpos() {
        return this._xpos;
      }
    set xpos(x) {
        this._xpos = x;
    }
    get ypos() {
        return this._ypos;
      }
    set ypos(x) {
        this._ypos = x;
    }
    get vX() {
        return this._vX;
      }
    set vX(x) {
        this._vX = x;
    }
    get vY() {
        return this._vY;
      }
    set vY(x) {
        this._vY = x;
    }
    get angle() {
        return this._angle;
      }
    set angle(x) {
        this._angle = x;
    }
    get rgb() {
        return this._rgb;
      }
    set rgb(x) {
        this._rgb = x;
    }
    ifFinish(currentTime){
        //Zmiana pozycji, wzory itd. To chyba ma byc w shaderze ale narazie tu
        if(currentTime >= this._finishTime)
            return true;
        else    
            return false;
    }
}