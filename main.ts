/**
 * Provides access to basic micro:bit functionality.
 */

enum ModuleIndex {
    //% block="module1"
    Module1,
    //% block="module2"
    Module2,
    //% block="module3"
    Module3,
    //% block="module4"
    Module4
}

enum TouchIndex {
    //% block="1"
    T1,
    //% block="2"
    T2,
}

enum SubIndex { 
    //% block="1"
    subModule1 = 1,
    //% block="2"
    subModule2,
    //% block="3"
    subModule3,
    //% block="4"
    subModule4
}

enum MesureContent {
    //% block="onboard temp"
    TempOnBoard,
    //% block="onboard humidity"
    HmOnBoard,
}


enum LedIndex {
    //% block="all"
    All,
    //% block="1"
    L1,
    //% block="2"
    L2,
    //% block="3"
    L3,
    //% block="4"
    L4,
    //% block="5"
    L5,
    //% block="6"
    L6,
    //% block="7"
    L7,
    //% block="8"
    L8,
    // //% block="9"
    // L9,
    // //% block="10"
    // L10,
    // //% block="11"
    // L11,
    // //% block="12"
    // L12  
}


enum Color {
    //% block="red"
    Red,
    //% block="orange"
    Orange,
    //% block="yellow"
    Yellow,
    //% block="green"
    Green,
    //% block="blue"
    Blue,
    //% block="indigo"
    Indigo,
    //% block="purple"
    Purple,
    //% block="white"
    White,
    //% block="black"
    Black
}

enum Scale {
    //% block= "Decimal"
    Decimal,
    //% block= "Hexadecimal"
    Hexadecimal
}

//% color=190 weight=100 icon="\uf1ec" block="Ovobot Modules"
namespace ovobotModules {
    const SONAR_ADDRESS = 0x52
    const SONAR_ADDRESS_2 = 0x58
    const SERVO_ADDRESS = 0x74
    const LED_ADDRESS = 0x53
    const SEG_ADDRESS = 0x6C
    const TOUCHKEY_ADDRESS = 0x70
    const RGB_TOUCHKEY_ADDRESS = 0x4C
    const TEMP_ADDRESS = 0x5c
    const IOT_ADDRESS = 0x50
    const PM_ADDRESS = 0x60
    const SPEECH_ADDRESS = 0x69
    const SOIL_ADDRESS = 0x48
    const LINE_ADDRESS = 0x51
    const COLOR_ADDRESS = 0x40
    const RGB_ADDRESS = 0x3C
    const PRESS_ADDRESS = 0x34
    const HOARE_ADDRESS = 0x44
    const INF_ADDRESS = 0x28
    const LOUDNESS_ADDRESS = 0x38
    const LED_DISPLAY_TEMP_ADDRESS = 0x2C
    const KEY_ADDRESS = 0x30
    const lowBright = 8
    const selectColors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0x800080, 0xffffff, 0x000000]
    let neopixeBuf = pins.createBuffer(26);

    function constract(val: number, minVal: number, maxVal: number): number {
        if (val > maxVal) {
            return maxVal;
        } else if (val < minVal) {
            return minVal;
        }
        return val;
    }

    function validate(str: String): Boolean { 
        let isfloat = false;
        let len = str.length;
        if (len > 5) { 
            return false;
        }
        for (let i = 0; i < len; i++) { 
            if (str.charAt(i) == ".") { 
                isfloat = true;
                return true;
            }
        }
        if (!isfloat && len == 5) { 
            return false;
        }
        return true;
    }

    /**
     * TODO: 获取超声波传感器与前方障碍物的距离函数。
     */
    //% block="read %module distance data"
    //% block weight=65
    export function readDistance(module: ModuleIndex): number {
        let sonarVal;
        if (module == 0) {
            pins.i2cWriteRegister(SONAR_ADDRESS + module, 0x00, 0x01);
            sonarVal = pins.i2cReadRegister(SONAR_ADDRESS + module, 0x01, NumberFormat.Int16LE);
        } else {
            pins.i2cWriteRegister(SONAR_ADDRESS_2 + module, 0x00, 0x01);
            sonarVal = pins.i2cReadRegister(SONAR_ADDRESS_2 + module, 0x01, NumberFormat.Int16LE);
        }
        let distance = sonarVal / 58;

        return distance;
    }

    /**
     * TODO: 控制舵机旋转。
     */
    //% block="control servo %module index %submod  rotate to %angle"
    //% angle.min=-90 angle.max=90
    //% weight=65
    export function controlServoOutput(module: ModuleIndex,submod:SubIndex, angle: number) {
        let buf = pins.createBuffer(8);
        let newangle = constract(angle, -90, 90);
        let output = 18.5 + 25 * angle / 180.0;
        pins.i2cWriteRegister(SERVO_ADDRESS + module, submod, output);
    }

    /**
     * TODO: 显示数码管数值。
     */
    //% blockId=display_seg_number block="control seg %module display number %num with %scale scale"
    //% weight=65
    export function displaySegNumber(module: ModuleIndex, num: number, scale: Scale) {
        let buf = pins.createBuffer(6);
        buf[0] = 0;
        buf[1] = 1;
        buf[2] = 0;
        buf[3] = 0;
        buf[4] = 0;
        buf[5] = 0;

        if (scale == Scale.Decimal) {
            let str_num = num.toString();
            let len = str_num.length;
            let j = 0;
            if (validate(str_num)) { 
                for (let i = len - 1; i >= 0; i--) { 
                    if (str_num.charAt(i) == '.') {
                        buf[5 - j] = (str_num.charCodeAt(i - 1) - '0'.charCodeAt(0)) | 0x80;
                        i--;
                    } else if (str_num.charAt(i) == "-") {
                        buf[5 - j] = 0x40;
                    } else { 
                        buf[5 - j] = str_num.charCodeAt(i) - '0'.charCodeAt(0);
                    }
                    j++;
                }
                pins.i2cWriteBuffer(SEG_ADDRESS + module, buf);
            }
        } else {
            let hex_num = Math.round(num)
            if (hex_num > 65535) {
                hex_num = 65535
            }
            buf[2] = (hex_num >> 12) & 0x000F
            buf[3] = (hex_num >> 8) & 0x000F
            buf[4] = (hex_num >> 4) & 0x000F
            buf[5] = (hex_num) & 0x000F
            pins.i2cWriteBuffer(SEG_ADDRESS + module, buf);
        }
    }

    
    /**
     * TODO: 读取触摸按键。
     */
    //% blockId=isTouchDown block="touchkey %module %index is touched?"
    //% weight=65
    export function isTouchDown(module: ModuleIndex, index: TouchIndex): boolean{
        pins.i2cWriteRegister(RGB_TOUCHKEY_ADDRESS + module, 0x00, 0x01);
        let data;
        if (index == 0) {
            data = pins.i2cReadRegister(RGB_TOUCHKEY_ADDRESS + module, 0x19, NumberFormat.UInt8LE);
        } else {
            data = pins.i2cReadRegister(RGB_TOUCHKEY_ADDRESS + module, 0x1A, NumberFormat.UInt8LE);
        }
        return (data == 1);
    }

    /**
     * TODO: 控制RGB灯条。
     */
    //% blockId=control_leds_output block="control neopixels %module %index color %color"
    //% weight=65
    export function controlNeopixels(module: ModuleIndex, index: LedIndex, color: Color) { 
        let startPos;
        //let ledBuf = pins.createBuffer(26);
        neopixeBuf[0] = 0;
        neopixeBuf[1] = 1;
        if (index == 0) {
            for (let i = 2; i < 24; i += 3) {
                neopixeBuf[i] = ((selectColors[color] >> 8) & 0xff) / lowBright;
                neopixeBuf[i + 1] = ((selectColors[color] >> 16) & 0xff) / lowBright;
                neopixeBuf[i + 2] = (selectColors[color] & 0xff) / lowBright;
            }
        } else { 
            startPos = 2 + 3 * (index-1);
            neopixeBuf[startPos] = ((selectColors[color] >> 8) & 0xff) / lowBright;
            neopixeBuf[startPos + 1] = ((selectColors[color] >> 16) & 0xff) / lowBright;
            neopixeBuf[startPos + 2] = (selectColors[color] & 0xff) / lowBright;
        }
        pins.i2cWriteBuffer(RGB_TOUCHKEY_ADDRESS + module, neopixeBuf);
    }



    /**
     * TODO: 读取数温湿度。
     */
    //% blockId=read_temp_humidity block="read %module  %measure data"
    //% weight=65

    export function readTempOrHumidity(module: ModuleIndex, measure: MesureContent): number{
        let onboardTempValue = 400;
        let humidityValue;
        pins.i2cWriteRegister(SEG_ADDRESS + module, 0x00, 0x01);
        let data1 = pins.i2cReadRegister(SEG_ADDRESS + module, 0x05, NumberFormat.UInt8LE);
        let data2 = pins.i2cReadRegister(SEG_ADDRESS + module, 0x06, NumberFormat.UInt8LE);
        let data3 = pins.i2cReadRegister(SEG_ADDRESS + module, 0x07, NumberFormat.UInt8LE);
        let data4 = pins.i2cReadRegister(SEG_ADDRESS + module, 0x08, NumberFormat.UInt8LE);
        onboardTempValue = -450 + 1750 * (data1 << 8 | data2) / 65535;
        humidityValue = 100 * (data3 << 8 | data4) / 65535;
        if (measure == 0) {
            return Math.round(onboardTempValue) * 0.1;
        } else if (measure == 1) {
            return Math.round(humidityValue);
        } 
        return 9999;
    }


    /**
     * TODO: 读取电位器。
     */
    //% blockId=read_pm block="read %module pm data"
    //% weight=65

    export function readPmData(module: ModuleIndex): number{
        pins.i2cWriteRegister(PM_ADDRESS + module, 0x00, 0x01);
        let data = pins.i2cReadRegister(PM_ADDRESS  + module , 0x01, NumberFormat.UInt8LE);
        let val = Math.round((255 - data) * 106 / 255) - 3;
        if (val < 0)
            val = 0;
        else if (val > 100)
            val = 100;
        return val;
    }

    /**
     * TODO: 读取土壤湿度。
     */
    //% blockId=read_SoilHSensor block="read %module SoilHSensor data"
    //% weight=65
    export function readSoilHSensorData(module: ModuleIndex): number{ 
        pins.i2cWriteRegister(SOIL_ADDRESS + module, 0x00, 0x01);
        let data = pins.i2cReadRegister(SOIL_ADDRESS  + module , 0x01, NumberFormat.UInt8LE);
        return (data);
    }
}
