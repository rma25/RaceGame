#pragma strict

//Variables for the timer and lap
var maxLap : Texture2D;
var lapNumber : Texture2D;
var currentTimer : GUIText;
//var lapTime : Texture2D;
var timer : float = 0.0; //For the current timer
private var startTime;

function Start () {

}

function Update () {
	timer += Time.deltaTime;
	var t = Mathf.Abs(timer); // get the absolute timer value
	var seconds: int = t % 60; // calculate the seconds
	var minutes: int = t / 60; // calculate the minutes
	var minSec = minutes + ":" + seconds; // create the formatted string
	currentTimer.text = minSec; // update the GUIText
	currentTimer.text = String.Format("{0:00}:{1:00}", minutes, seconds);
}