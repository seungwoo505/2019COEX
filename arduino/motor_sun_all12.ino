#include <Stepper.h>
#include <Arduino.h>
#include <Math.h>

#define SBUF_SIZE 64    //센서
#define my_Lon 127.058833 //내 경도
#define my_Lat 37.511223// 내 위도
#define Now_year 2019   //시간들
#define Now_month 10
#define Now_day 8
//#define Now_hour 13
#define Now_minute 35
#define GMT 9
int Now_hour = 12;

char sbuf[SBUF_SIZE];   //센서
signed int sbuf_cnt=0; //센서

float ele_value = 0;
float deg_value = 0;

float sun_ele, sun_deg;   //계산된 태양위치들
float now_deg = 0;     //돌린후 자깅위치
float d = 0;

void Sun_loc(void); // 태양위치 계산

void DoMotor_A(float x); // 고도 모터
void DoMotor_B(float y); // 방위각 모터

float SensorAll(void);     //센서

void BackMotor_B(float back);
void Motor_A_error(void); //고도모터 에러
void Motor_B_error(void);  // 방위각 모터 에러 


void setup() {
  Serial.begin(115200);
}


void loop() {
    
    
    Sun_loc();          //태양위치 계산
    
    SensorAll();        //센서 위치 받기

    
    delay(5000);
    if(sun_ele>30.0)
    DoMotor_A(ele_value);   //고도모터 돌리기
    //if(abs(Deg_sensor()-sun_deg)=<3)Motor_B_error();//오류
    
     Serial.println("고도 끝");  
    if(sun_deg<270){
        DoMotor_B(deg_value);   //방위각 모터 돌리기
        now_deg = sun_deg;
        Now_hour++;
        if(Now_hour == 24);
            Now_hour =6;
    Serial.println("방위각 끝");  
    }
    else if(deg_value>=270&&sun_deg>=270)
        BackMotor_B(deg_value-90);   
    //if(abs(Ele_sensor()-sun_ele)<=3)Motor_A_error();//오류
   
    
  delay(60000);
}


void Sun_loc(void)//태양의 고도와 방위각을 구하는 함수
{
  float my_Lon_ra, my_Lat_ra;
  my_Lon_ra = my_Lon*PI/180;
  my_Lat_ra = my_Lat*PI/180;
 
  float hour, pa, mean_Lon, Lon,ep_ra, Lon_ra, Lat, Lat_ra, Dec, Dec_ra, Ele, Ele_ra, Deg,lmst, Deg_ra,gmst, HRA,HRA_ra,EOT,n,OM,jd,g,ep,g_ra,OM_ra; 
  jd = (1461.0*(Now_year+4800+(Now_month-14)/12))/4+(367*(Now_month-2-12*((Now_month-14)/12)))/12-(3*((Now_year+4900+(Now_month-14)/12)/100))/4+Now_day-32075-0.5+Now_hour/24.0;
 
  n= jd - 2451545.0;
  OM = 2.1429-0.0010394594*n;
  mean_Lon = 4.8950630+0.017202791698*n;
  g = 6.2400600+0.0172019699*n;
  Lon = mean_Lon + 0.03341607*sin(g)+0.00034894*sin(2*g)-0.0001134-0.0000203*sin(OM);
  ep = 0.4090928-6.2140*0.000000001*n+0.0000396*cos(OM);  


 Lat = atan(cos(ep)*sin(Lon)/cos(Lon));
 if(cos(Lon) < 0 ) Lat =Lat + PI;
 else if (cos(Lon) >=0 & cos(ep)*sin(Lon) <0) Lat = Lat + 2*PI;
 Dec = (asin(sin(ep)*sin(Lon)));
 hour = Now_hour + Now_minute/60;
 gmst = 6.6974243242+0.0657098283*n + hour;
 lmst = (gmst*15+my_Lon_ra)*(PI/180);
 HRA = (lmst - Lat);
 HRA_ra=HRA*PI/180;
 //Ele_ra = acos(cos(my_Lat_ra)*cos(HRA)*cos(Dec)+sin(Dec)*sin(my_Lat_ra));
 //Ele_ra = acos(cos(Lat)*cos(HRA)*cos(Dec)+sin(Dec)*sin(Lat));
 Ele_ra = asin(cos(my_Lat_ra)*cos(Dec)*cos(HRA)+sin(my_Lat_ra)*sin(Dec));
 pa = 6371.0/149597890.0 *sin(Ele_ra);
 Ele = Ele_ra * 180/PI + pa;
 Deg_ra = asin(-cos(Dec)*sin(HRA)/cos(Ele_ra));
 if(sin(Dec) - sin(Ele_ra) *sin(my_Lat_ra) >= 0 & sin(Deg_ra) <0) Deg_ra =Deg_ra + 2*PI;
 else if( sin(Dec) - sin(Ele_ra) *sin(my_Lat_ra) < 0) Deg_ra = PI - Deg_ra;
 Deg = Deg_ra *180/PI;

 sun_ele = Ele;     //고도
 sun_deg = Deg;     //방위각

 Serial.print(Now_year);
 Serial.print("년 ");
 Serial.print(Now_month);
 Serial.print("월 ");
 Serial.print(Now_day);
 Serial.print("일 ");
 Serial.print(Now_hour);
 Serial.print("시 ");
 Serial.print(Now_minute);
 Serial.println("분 ");
 
 Serial.print("태양의 적경 : ");
 Serial.print(Lat*180/PI);
 Serial.print("  ");
 Serial.print("태양의 적위 : ");
 Serial.println(Dec*180/PI);

 Serial.print("태양의 고도 : ");
 Serial.print(Ele);
 Serial.print("  ");
 Serial.print("태양의 방위각 : ");
 Serial.println(Deg);
 //Now_minute++;
// delay(60000000);
}

void DoMotor_A(float x){
  int steps_A,a;
  if(sun_ele<=40)sun_ele = 40;                //55도가 1도  최소각도40 최대각도85  x =ele_value
  else if(sun_ele>=85)sun_ele = 85; 
  backc:
  if(ele_value<0)steps_A = (90-sun_ele-ele_value)*55.0;          
  else if(ele_value>0){
    if(ele_value>(90-sun_ele))steps_A = (sun_ele-90+ele_value)*-55.0;
    else if(ele_value<(90-sun_ele))steps_A = (90-sun_ele-ele_value)*55.0;
    else steps_A = 0;
  }
  else {
        SensorAll();
        goto backc;
  }

  a= steps_A/100;                             // 스텝수가 너무 높으면 모터가 안돌아서  스텝수를 나눠서 여러번돌림
  if(a>0){
    steps_A = steps_A/a;
    Stepper stepper_A(steps_A, 4, 5 ,7 ,6 );//필요
    stepper_A.setSpeed(50);
    for(int i =0; i < a; i++){
      stepper_A.step(steps_A);
      }
  }
  else if(a<0){
    steps_A = steps_A/a;
    Stepper stepper_A(steps_A,4,5,7,6);
    stepper_A.setSpeed(50);
    for(int i = 0; i<abs(a); i++){
      stepper_A.step(-steps_A);
      }
  }
  else{
    Stepper stepper_A(steps_A,4,5,7,6);
    stepper_A.setSpeed(50);
    stepper_A.step(steps_A);
  }
}
void DoMotor_B(float y){

  if (deg_value == 180) {
    SensorAll();
  }
  int steps_B,b=1;
  steps_B = (sun_deg - deg_value)*55.0;
  
  b=steps_B/100;

  
  if(b>0){
    steps_B = steps_B/b;
    Stepper stepper_B(steps_B,9,10,12,11);
    stepper_B.setSpeed(50);
    for(int i = 0; i<b; i++){
      stepper_B.step(steps_B);
      }
  }
  else if(b<0){
    steps_B = steps_B/b;
    Stepper stepper_B(steps_B,9,10,12,11);
    stepper_B.setSpeed(50);
    for(int i = 0; i<abs(b); i++){
      stepper_B.step(-steps_B);
     }
  }
  else{
    Stepper stepper_B(steps_B,9,10,12,11);
    stepper_B.setSpeed(50);
    stepper_B.step(steps_B);
  }
}

void BackMotor_B(float back){
  int steps_B,b=1;
  steps_B = back*55.0;
  b=steps_B/100;
  Stepper stepper_B(steps_B,9,10,12,11);
  stepper_B.setSpeed(50);
  for(int i = 0; i < b; i++){
  stepper_B.step(steps_B);
  }
}
void Motor_A_error(void){
  //고도모터 오류
}

void Motor_B_error(void){
  //방위각 모터 오류
}


float SensorAll(void){
    float euler[3];
    float elesum=0;
    float degsum=0;
    for(int i =0; i<100; i++){
    if(EBimuAsciiParser(euler,3)){
      elesum=euler[0];
      degsum=euler[2]+180;
      Serial.print("고도 : ");
      Serial.print(elesum);
      Serial.print("방위각 : ");
      Serial.println(degsum);
      }
    }
    ele_value = elesum;
    deg_value = degsum;
    Serial.print("진짜고도 : ");
    Serial.println(ele_value);
    Serial.print("진짜방위각 : ");
    Serial.println(deg_value);
  
}

int EBimuAsciiParser(float *item, int number_of_item)
{
  int n,i;
  int rbytes;
  char *addr; 
  int result = 0;
  
  rbytes = Serial.available();
  for(n=0;n<rbytes;n++)
  {
    sbuf[sbuf_cnt] = Serial.read();
    if(sbuf[sbuf_cnt]==0x0a)
       {
           addr = strtok(sbuf,",");
           for(i=0;i<number_of_item;i++)
           {
              item[i] = atof(addr);
              addr = strtok(NULL,",");
           }
 
           result = 1;
       }
     else if(sbuf[sbuf_cnt]=='*')
       {   sbuf_cnt=-1;
       }
 
     sbuf_cnt++;
     if(sbuf_cnt>=SBUF_SIZE) sbuf_cnt=0;
  }
  
  return result;
}
