#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9340.h"

#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>  
SoftwareSerial mySerial(7,6); // Arudino Uno port TX, RX  

#if defined(__SAM3X8E__)
    #undef __FlashStringHelper::F(string_literal)
    #define F(string_literal) string_literal
#endif

#define START_1 0x42  
#define START_2 0x4d  
#define DATA_LENGTH_H        0  
#define DATA_LENGTH_L        1  
#define PM1_0_ATMOSPHERE_H   8  
#define PM1_0_ATMOSPHERE_L   9  
#define PM2_5_ATMOSPHERE_H   10  
#define PM2_5_ATMOSPHERE_L   11  
#define PM10_ATMOSPHERE_H    12  
#define PM10_ATMOSPHERE_L    13  
#define PM2_5_PARTICLE_H   16  
#define PM2_5_PARTICLE_L   17  
#define VERSION              26  
#define ERROR_CODE           27  
#define CHECKSUM             29  

#define _sclk 13
#define _miso 12
#define _mosi 11
#define _cs 10
#define _dc 9
#define _rst 8

byte bytCount1 = 0;  
byte bytCount2 = 0;  
unsigned char chrRecv;  
unsigned char chrData[30];
int PM25;  
int PM10;  

Adafruit_ILI9340 tft = Adafruit_ILI9340(_cs, _dc, _rst);

unsigned int GetPM_Data(unsigned char chrSrc[], byte bytHigh, byte bytLow)  
{  
   return (chrSrc[bytHigh] << 8) + chrSrc[bytLow];  
}  
  
void setup(){  
  Serial.begin(115200);  
  Serial.println("PMS7003 Ready ");  
  mySerial.begin(9600);  

  pinMode(5,OUTPUT);

  tft.begin();
  tft.setRotation(1);
  
  tft.fillScreen(ILI9340_BLACK);

  tft.setTextColor(ILI9340_WHITE);  
  tft.setTextSize(4);
  tft.println("\nPM10: ");

  tft.setTextColor(ILI9340_WHITE);  
  tft.setTextSize(4);
  tft.println("\nPM2.5:");
}  
  
void loop(){  
  if (mySerial.available()){
       for(int i = 0; i < 32; i++){  
           chrRecv = mySerial.read();  
           if (chrRecv == START_2 ) {
              bytCount1 = 2;  
              break;  
            }  
       }
      if (bytCount1 == 2)  
      {  
         bytCount1 = 0;  
         for(int i = 0; i < 30; i++){  
            chrData[i] = mySerial.read();  
         }   
  
         if ( (unsigned int) chrData[ERROR_CODE] == 0 ) {  

            PM25  = GetPM_Data(chrData, PM2_5_ATMOSPHERE_H, PM2_5_ATMOSPHERE_L);  
            PM10  = GetPM_Data(chrData, PM10_ATMOSPHERE_H, PM10_ATMOSPHERE_L);  
         
            if(PM10>80 || PM25>50){ //미세먼지 팬 모터 on
              digitalWrite(5,LOW);
            }else{ // 팬 모터 off
              digitalWrite(5,HIGH);
            }  
            Serial.print(",PM2.5=");  
            Serial.print(PM25);  
            Serial.print(",PM10=");  
            Serial.println(PM10);
        }else Serial.println("PMS7003  ERROR"); 
      }
   }  
   else Serial.println("PMS7003 NOT available");
   
   Text();
}

unsigned long Text() {
  unsigned long start = micros();

  tft.fillRect(170, 30, 120, 50, ILI9340_BLACK); //BLACK

  tft.setCursor(170, 30);
  if(PM10>79) tft.setTextColor(ILI9340_RED);
    else if(PM10>30) tft.setTextColor(ILI9340_GREEN);
    else if(PM10>0) tft.setTextColor(ILI9340_BLUE); 
   tft.println(PM10);
   tft.setTextSize(6);

  tft.fillRect(170, 90, 120, 50, ILI9340_BLACK);
  
  tft.setCursor(170, 90);
  
  if(PM25>50) tft.setTextColor(ILI9340_RED);
  else if(PM25>15) tft.setTextColor(ILI9340_GREEN);
  else if(PM25>0) tft.setTextColor(ILI9340_BLUE); 
  tft.setTextSize(6);
  tft.println(PM25);

  tft.fillRect(160, 160, 160, 50, ILI9340_BLACK);
  
  return micros() - start;
}
