#pragma strict
var timer : float = 0.0;
var PollLightObj : GameObject;
var DirectionalLightObj : GameObject;
var DaySkyObj : GameObject;
var NightSkyObj : GameObject;
var LightHouseObj : GameObject;
var holyTreeAtNight : GameObject;
var SunSetObj : GameObject;
private var isSunSet : boolean;
private var isNightTime : boolean;
private var isDayTime : boolean;

function Start () {

}

function Update () {
	weatherControl();
}

function weatherControl ()
{
	timer += Time.deltaTime;
	var t = Mathf.Abs(timer);
	var minutes: int = t / 60; // calculate the minutes
	
	//night and afternoon will last a minute longer (will transition from sunset, afternoon, night in that cycle)
	if(minutes >=0 && minutes < 2)
	{
		isDayTime = true;
	}
	if(minutes >= 2 && minutes < 3)
	{
		isDayTime = false;
		isSunSet = true;
	}
	else if(minutes >= 3 && minutes < 5)
	{
		isSunSet = false;
		isDayTime = false;
		isNightTime = true;
	} 
	else if(minutes >= 5 && minutes < 6)
	{
		isNightTime = false;
		isDayTime = false;
		isSunSet = true;
	}
	else if(minutes >= 6 && minutes < 8)
	{
		isSunSet = false;
		isNightTime = false;
		isDayTime = true;
	}
	else if(minutes >= 8 && minutes < 9)
	{
		isDayTime = false;
		isNightTime = false;
		isSunSet = true;
	}
	else if(minutes >= 9 && minutes < 11)
	{
		isSunSet = false;
		isDayTime = false;
		isNightTime = true;
	}
	else if(minutes >= 12 && minutes < 13)
	{
		isNightTime = false;
		isDayTime = false;
		isSunSet = true;
	}
	else if(minutes >= 13) //After 13 mins will stay afternoon forever
	{
		isSunSet = false;
		isNightTime = false;
		isDayTime = true;
	}
 	
 	//I know I could of done this in the same if statement, I just want to be easy to read
 	if(isNightTime)
 	{
 		PollLightObj.SetActive(true);
 		DirectionalLightObj.SetActive(false);
 		NightSkyObj.SetActive(true);
 		LightHouseObj.SetActive(true);
 		holyTreeAtNight.SetActive(true); //If it's night time the holy tree will appear
 	}
 	else
 	{
 		PollLightObj.SetActive(false);
 		DirectionalLightObj.SetActive(true);
 		NightSkyObj.SetActive(false);
 		LightHouseObj.SetActive(false);
 		holyTreeAtNight.SetActive(false);
 	}
 	
 	//this will take of the sun rising or setting
 	if(isSunSet)
 	{
 		DirectionalLightObj.light.intensity = 0.35; //directional light
		SunSetObj.SetActive(true);
 	}
 	else
 	{
 		SunSetObj.SetActive(false);
		DirectionalLightObj.light.intensity = 0.55;
 	}
 	
 	
 	if(isDayTime)
 	{
 		DaySkyObj.SetActive(true);
 	}
 	else
 	{
 		DaySkyObj.SetActive(false);
 	}
	
}