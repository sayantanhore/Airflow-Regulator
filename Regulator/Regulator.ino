// Status variables

const char LISTENING = '1';
const char TEMPERATURE_RECEIVED = '2';

const int tipPin = 11;
int value = 0;
int valToWrite;

char temperature[3];

int counter;
int listening = 0;

void setup()
{
  Serial.begin(9600);
  pinMode(tipPin, OUTPUT);
  counter = 0;
}

void loop()
{
  if(listening == 0){
    listening = 1;
    Serial.print(LISTENING);
    Serial.flush();
  }
  if(Serial.available()){
    char temp = Serial.read();
    if(temp == 'p'){
      
      temperature[counter] = '\0';
      counter = 0;
      value = atoi(temperature);
      
      
      if(value < 10)
      {
        valToWrite = 0;
      }
      else if(value > 10 && value < 40)
      {
        valToWrite = 50;
      }
      else if(value > 40 && value < 100)
      {
        valToWrite = 100;
      }
      else
      {
        valToWrite = 200;
      }
      analogWrite(tipPin, valToWrite);
      listening = 0;
      Serial.print(TEMPERATURE_RECEIVED);
      Serial.flush();
      delay(500);
    }
    else{
      temperature[counter] = temp;
      counter++;
    }
  }
}


