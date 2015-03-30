#pragma strict
var timer : float = 0.0;
var isNightTime : boolean;
var PollLightObj : GameObject;
var SunLightObj : GameObject;
var DaySkyObj : GameObject;
var NightSkyObj : GameObject;
var LightHouseObj : GameObject;
var holyTreeAtNight : GameObject;

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
	
	if(minutes >= 2 && minutes < 5)//Every 2 mins will stay night time
	{
		isNightTime = true;
	} 
	else if(minutes >= 5 && minutes < 7)//After 3 minutes will go back to day time 
	{
		isNightTime = false;
	}
	else if(minutes >= 7 && minutes < 10)
	{
		isNightTime = true;
	}
	else if(minutes >= 10)
	{
		isNightTime = false;
	}
 	
 	//I know I could of done this in the same if statement, I just want to be easy to read
 	if(isNightTime)
 	{
 		PollLightObj.SetActive(true);
 		SunLightObj.SetActive(false);
 		DaySkyObj.SetActive(false);
 		NightSkyObj.SetActive(true);
 		LightHouseObj.SetActive(true);
 		holyTreeAtNight.SetActive(true); //If it's night time the holy tree will appear
 	}
 	else
 	{
 		PollLightObj.SetActive(false);
 		SunLightObj.SetActive(true);
 		DaySkyObj.SetActive(true);
 		NightSkyObj.SetActive(false);
 		LightHouseObj.SetActive(false);
 		holyTreeAtNight.SetActive(false);
 	}
	
	// I was gonna add rain but it takes a towe on the computer so I didn't
}