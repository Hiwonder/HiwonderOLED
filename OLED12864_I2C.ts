/**
* makecode I2C OLED 128x64 Package.
* From microbit/micropython Chinese community.
* http://www.micropython.org.cn
*/

//% weight=20 color=#0855AA icon="O" block="OLED12864_I2C"
namespace OLED12864_I2C {
    let font: number[] = [
        0x000000, 0x000000,// sp
        0x000000, 0x2f0000,// !
        0x000007, 0x000700,// "
        0x00147f, 0x147f14,// #
        0x00242a, 0x7f2a12,// $
        0x006264, 0x081323,// %
        0x003649, 0x552250,// &
        0x000005, 0x030000,// '
        0x00001c, 0x224100,// (
        0x000041, 0x221c00,// )
        0x001408, 0x3E0814,// *
        0x000808, 0x3E0808,// +
        0x000000, 0xA06000,// ,
        0x000808, 0x080808,// -
        0x000060, 0x600000,// .
        0x002010, 0x080402,// /
        0x003E51, 0x49453E,// 0
        0x000042, 0x7F4000,// 1
        0x004261, 0x514946,// 2
        0x002141, 0x454B31,// 3
        0x001814, 0x127F10,// 4
        0x002745, 0x454539,// 5
        0x003C4A, 0x494930,// 6
        0x000171, 0x090503,// 7
        0x003649, 0x494936,// 8
        0x000649, 0x49291E,// 9
        0x000036, 0x360000,// :
        0x000056, 0x360000,// ;
        0x000814, 0x224100,// <
        0x001414, 0x141414,// =
        0x000041, 0x221408,// >
        0x000201, 0x510906,// ?
        0x003249, 0x59513E,// @
        0x007C12, 0x11127C,// A
        0x007F49, 0x494936,// B
        0x003E41, 0x414122,// C
        0x007F41, 0x41221C,// D
        0x007F49, 0x494941,// E
        0x007F09, 0x090901,// F
        0x003E41, 0x49497A,// G
        0x007F08, 0x08087F,// H
        0x000041, 0x7F4100,// I
        0x002040, 0x413F01,// J
        0x007F08, 0x142241,// K
        0x007F40, 0x404040,// L
        0x007F02, 0x0C027F,// M
        0x007F04, 0x08107F,// N
        0x003E41, 0x41413E,// O
        0x007F09, 0x090906,// P
        0x003E41, 0x51215E,// Q
        0x007F09, 0x192946,// R
        0x004649, 0x494931,// S
        0x000101, 0x7F0101,// T
        0x003F40, 0x40403F,// U
        0x001F20, 0x40201F,// V
        0x003F40, 0x38403F,// W
        0x006314, 0x081463,// X
        0x000708, 0x700807,// Y
        0x006151, 0x494543,// Z
        0x00007F, 0x414100,// [
        0x00552A, 0x552A55,// 55
        0x000041, 0x417F00,// ]
        0x000402, 0x010204,// ^
        0x004040, 0x404040,// _
        0x000001, 0x020400,// '
        0x002054, 0x545478,// a
        0x007F48, 0x444438,// b
        0x003844, 0x444420,// c
        0x003844, 0x44487F,// d
        0x003854, 0x545418,// e
        0x00087E, 0x090102,// f
        0x0018A4, 0xA4A47C,// g
        0x007F08, 0x040478,// h
        0x000044, 0x7D4000,// i
        0x004080, 0x847D00,// j
        0x007F10, 0x284400,// k
        0x000041, 0x7F4000,// l
        0x007C04, 0x180478,// m
        0x007C08, 0x040478,// n
        0x003844, 0x444438,// o
        0x00FC24, 0x242418,// p
        0x001824, 0x2418FC,// q
        0x007C08, 0x040408,// r
        0x004854, 0x545420,// s
        0x00043F, 0x444020,// t
        0x003C40, 0x40207C,// u
        0x001C20, 0x40201C,// v
        0x003C40, 0x30403C,// w
        0x004428, 0x102844,// x
        0x001CA0, 0xA0A07C,// y
        0x004464, 0x544C44,// z
        0x141414, 0x141414,// horiz lines
];

    let _I2CAddr = 0;
    let _screen = pins.createBuffer(1025);
    let _buf2 = pins.createBuffer(2);
    let _buf3 = pins.createBuffer(3);
    let _buf4 = pins.createBuffer(4);
    let _ZOOM = 1;

    function cmd1(d: number) {
        let n = d % 256;
        pins.i2cWriteNumber(_I2CAddr, n, NumberFormat.UInt16BE);
    }

    function cmd2(d1: number, d2: number) {
        _buf3[0] = 0;
        _buf3[1] = d1;
        _buf3[2] = d2;
        pins.i2cWriteBuffer(_I2CAddr, _buf3);
    }

    function cmd3(d1: number, d2: number, d3: number) {
        _buf4[0] = 0;
        _buf4[1] = d1;
        _buf4[2] = d2;
        _buf4[3] = d3;
        pins.i2cWriteBuffer(_I2CAddr, _buf4);
    }

    function set_pos(col: number = 0, page: number = 0) {
        cmd1(0xb0 | page) // page number
        let c = col
        cmd1(0x00 | (c % 16)) // lower start column address
        cmd1(0x10 | (c >> 4)) // upper start column address    
    }

    // clear bit
    function clrbit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    /**
     * set pixel in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param color is dot color, eg: 1
     */
    //% blockId="OLED12864_I2C_PIXEL" block="set pixel at x %x|y %y|color %color"
    //% weight=70 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function pixel(x: number, y: number, color: number = 1) {
        let page = y >> 3
        let shift_page = y % 8
        let ind = x + page * 128 + 1
        let b = (color) ? (_screen[ind] | (1 << shift_page)) : clrbit(_screen[ind], shift_page)
        _screen[ind] = b
        set_pos(x, page)
        // if (_ZOOM) {
        //     _screen[ind + 1] = b
        //     _buf3[0] = 0x40
        //     _buf3[1] = _buf3[2] = b
        //     pins.i2cWriteBuffer(_I2CAddr, _buf3)
        // }
        // else {
        //     _buf2[0] = 0x40
        //     _buf2[1] = b
        //     pins.i2cWriteBuffer(_I2CAddr, _buf2)
        // }
            _buf2[0] = 0x40
            _buf2[1] = b
            pins.i2cWriteBuffer(_I2CAddr, _buf2)
    }

    /**
     * show text in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param s is the text will be show, eg: 'Hello!'
     * @param color is string color, eg: 1
     */
    //% blockId="OLED12864_I2C_SHOWSTRING" block="show string at x %x|y %y|text %s|color %color"
    //% weight=80 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function showString(x: number, y: number, s: string, color: number = 1) {
        let col = 0
        let p = 0
        let ind = 0
        _screen.fill(0)
        let ind0 = x * 6 + y * 128
        ind = ind0 + s.length * 6
        for (let n = 0; n < s.length; n++) {
            let fontLine = s.charCodeAt(n) - 0x20
            let fontIndex = fontLine * 2
            _screen[ind0 + n * 6] = (font[fontIndex] & 0x00FF0000) >> 16
            _screen[ind0 + 1 + n * 6] = (font[fontIndex] & 0x0000FF00) >> 8
            _screen[ind0 + 2 + n * 6] = (font[fontIndex] & 0x000000FF)
            _screen[ind0 + 3 + n * 6] = (font[fontIndex + 1] & 0x00FF0000) >> 16
            _screen[ind0 + 4 + n * 6] = (font[fontIndex + 1] & 0x0000FF00) >> 8
            _screen[ind0 + 5 + n * 6] = (font[fontIndex + 1] & 0x000000FF)
        }
        set_pos(x * 6, y)

        let buf = _screen.slice(ind0, ind)
        buf[0] = 0x40
        pins.i2cWriteBuffer(_I2CAddr, buf)
    }

    /**
     * show a number in OLED
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param num is the number will be show, eg: 12
     * @param color is number color, eg: 1
     */
    //% blockId="OLED12864_I2C_NUMBER" block="show a Number at x %x|y %y|number %num|color %color"
    //% weight=80 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function showNumber(x: number, y: number, num: number, color: number = 1) {
        showString(x, y, num.toString(), color)
    }

    /**
     * draw a horizontal line
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param len is the length of line, eg: 10
     * @param color is line color, eg: 1
     */
    //% blockId="OLED12864_I2C_HLINE" block="draw a horizontal line at x %x|y %y|number %len|color %color"
    //% weight=71 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function hline(x: number, y: number, len: number, color: number = 1) {
        for (let i = x; i < (x + len); i++)
            pixel(i, y, color)
    }

    /**
     * draw a vertical line
     * @param x is X alis, eg: 0
     * @param y is Y alis, eg: 0
     * @param len is the length of line, eg: 10
     * @param color is line color, eg: 1
     */
    //% blockId="OLED12864_I2C_VLINE" block="draw a vertical line at x %x|y %y|number %len|color %color"
    //% weight=72 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function vline(x: number, y: number, len: number, color: number = 1) {
        for (let i = y; i < (y + len); i++)
            pixel(x, i, color)
    }

    /**
     * draw a rectangle
     * @param x1 is X alis, eg: 0
     * @param y1 is Y alis, eg: 0
     * @param x2 is X alis, eg: 60
     * @param y2 is Y alis, eg: 30
     * @param color is line color, eg: 1
     */
    //% blockId="OLED12864_I2C_RECT" block="draw a rectangle at x1 %x1|y1 %y1|x2 %x2|y2 %y2|color %color"
    //% weight=73 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function rect(x1: number, y1: number, x2: number, y2: number, color: number = 1) {
        if (x1 > x2)
            x1 = [x2, x2 = x1][0];
        if (y1 > y2)
            y1 = [y2, y2 = y1][0];
        hline(x1, y1, x2 - x1 + 1, color)
        hline(x1, y2, x2 - x1 + 1, color)
        vline(x1, y1, y2 - y1 + 1, color)
        vline(x2, y1, y2 - y1 + 1, color)
    }

    /**
     * invert display
     * @param d true: invert / false: normal, eg: true
     */
    //% blockId="OLED12864_I2C_INVERT" block="invert display %d"
    //% weight=65 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function invert(d: boolean = true) {
        let n = (d) ? 0xA7 : 0xA6
        cmd1(n)
    }

    /**
     * draw / redraw screen
     */
    //% blockId="OLED12864_I2C_DRAW" block="draw"
    //% weight=64 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function draw() {
        set_pos()
        pins.i2cWriteBuffer(_I2CAddr, _screen)
    }

    /**
     * clear screen
     */
    //% blockId="OLED12864_I2C_CLEAR" block="clear"
    //% weight=63 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function clear() {
        _screen.fill(0)
        _screen[0] = 0x40
        draw()
    }

    /**
     * turn on screen
     */
    //% blockId="OLED12864_I2C_ON" block="turn on"
    //% weight=62 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function on() {
        cmd1(0xAF)
    }

    /**
     * turn off screen
     */
    //% blockId="OLED12864_I2C_OFF" block="turn off"
    //% weight=61 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function off() {
        cmd1(0xAE)
    }

    /**
     * zoom mode
     * @param d true zoom / false normal, eg: true
     */
    //% blockId="OLED12864_I2C_ZOOM" block="zoom %d"
    //% weight=60 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function zoom(d: boolean = true) {
        _ZOOM = (d) ? 1 : 0
        cmd2(0xd6, _ZOOM)
    }

    /**
     * OLED initialize
     * @param addr is i2c addr, eg: 60
     */
    //% blockId="OLED12864_I2C_init" block="init OLED with addr %addr"
    //% weight=100 blockGap=8
    //% parts=OLED12864_I2C trackArgs=0
    export function init(addr: number) {
        _I2CAddr = addr;
        cmd1(0xAE)       // SSD1306_DISPLAYOFF
        cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
        cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
        cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
        cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
        cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
        cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
        cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
        cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
        cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
        cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
        cmd1(0xc8)       // SSD1306_COMSCANDEC
        cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
        cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
        cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
        cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
        cmd1(0xA6)       // SSD1306_NORMALDISPLAY
        cmd2(0xD6, 1)    // zoom on
        cmd1(0xAF)       // SSD1306_DISPLAYON
        clear()
        _ZOOM = 1
    }
}
