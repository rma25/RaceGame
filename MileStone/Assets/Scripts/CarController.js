#pragma strict

var centerOfMass : Vector3;
var wheelFL : WheelCollider;
var wheelFR : WheelCollider;
var wheelRL : WheelCollider;
var wheelRR : WheelCollider;
var wheelFLTrans : Transform;
var wheelFRTrans : Transform;
var wheelRLTrans : Transform;
var wheelRRTrans : Transform;
var maxTorque : float = 50;
var lowestSteerAtSpeed : float = 50;/*limit speed of the car*/
var lowSpeedSteerAngle : float = 13;
var highSpeedSteerAngle : float = 1;
var decelarationSpeed : float = 30;
@HideInInspector
var currentSpeed : float;
var topSpeed : float = 200;
var maxReverseSpeed : float = 30;
var eulerTest : Vector3;
/*for brake lights*/
var brakeLightObject : GameObject;
var reverseLightObject : GameObject;
var maxBrakeTorque : float = 100;
var gearRatio : int[];
private var mySidewayFriction : float;
private var myForwardFriction : float;
private var slipSidewayFriction : float;
private var slipForwardFriction : float;
private var braked : boolean = false;
//Variable for the Speedometer
var speedOMeterDial : Texture2D;
var speedOMeterPointer : Texture2D;
var rpmPointer : Texture2D; //Not being used but it's available
var rpmDial : Texture2D;	//Not being used but it's available
var spark : GameObject;
var collisionSound : GameObject;

function Start () {
	rigidbody.centerOfMass = centerOfMass;
	SetValues();
}

function SetValues(){

	myForwardFriction = wheelRR.forwardFriction.stiffness;
	mySidewayFriction = wheelRR.sidewaysFriction.stiffness;
	slipForwardFriction = 0.05;
	slipSidewayFriction = 0.085;//Work on this Sliding too much
}

function FixedUpdate () {

	Controle();
	HandBrake();
}

function Update(){

	wheelFLTrans.Rotate(wheelFL.rpm/60*360*Time.deltaTime,0,0);
	wheelFRTrans.Rotate(wheelFR.rpm/60*360*Time.deltaTime,0,0);
	wheelRLTrans.Rotate(wheelRL.rpm/60*360*Time.deltaTime,0,0);
	wheelRRTrans.Rotate(wheelRR.rpm/60*360*Time.deltaTime,0,0);
	wheelFLTrans.localEulerAngles.y = wheelFL.steerAngle - wheelFLTrans.localEulerAngles.z;
	wheelFRTrans.localEulerAngles.y = wheelFR.steerAngle - wheelFRTrans.localEulerAngles.z;
	eulerTest = wheelFLTrans.localEulerAngles;
	eulerTest = wheelFRTrans.localEulerAngles;
	BackLight();
	WheelPosition();
	ReverseSlip();
	EngineSound();
}

function Controle(){

	currentSpeed = 2*22/7*wheelRL.radius*wheelRL.rpm*60/1000; /*math formula to see how fast a car is moving*/
	currentSpeed = Mathf.Round(currentSpeed);

	if(currentSpeed < topSpeed && currentSpeed > -maxReverseSpeed){
		wheelRR.motorTorque = maxTorque * Input.GetAxis("Vertical");
		wheelRL.motorTorque = maxTorque * Input.GetAxis("Vertical");
	}
	else{
		wheelRR.motorTorque = 0;
		wheelRL.motorTorque = 0;
	}
	if (Input.GetButton("Vertical")== false) //|| Input.GetButton("GasPedal") == false)
	{
		wheelRR.brakeTorque = decelarationSpeed;
		wheelRL.brakeTorque = decelarationSpeed;
	}
	else{
		wheelRR.brakeTorque = 0;
		wheelRL.brakeTorque = 0;
	}
	var speedFactor = rigidbody.velocity.magnitude/lowestSteerAtSpeed;
	var currentSteerAngle = Mathf.Lerp(lowSpeedSteerAngle, highSpeedSteerAngle, speedFactor);
	currentSteerAngle *= Input.GetAxis("Horizontal");
	wheelFL.steerAngle = currentSteerAngle;
	wheelFR.steerAngle = currentSteerAngle;
}

/*Currently don't have the graphics for it, although the function is available and working*/
function BackLight(){
	if(currentSpeed > 0 && Input.GetAxis("Vertical")<0){ //If I brake while going forward
		brakeLightObject.SetActive(true);
	}
	else if(currentSpeed < 0 && Input.GetAxis("Vertical")>0){ //If I brake on reverse
		brakeLightObject.SetActive(true);	
	}
	else if(currentSpeed < 0 && Input.GetAxis("Vertical")<0){/*reverse*/
		reverseLightObject.SetActive(true);
	}
	else{/*No brake light should light up*/
		brakeLightObject.SetActive(false);
		reverseLightObject.SetActive(false);
	}
}

function WheelPosition(){

	var hit : RaycastHit;
	var wheelPos : Vector3;
	/*in case it hits something on the ground, must apply to every wheel*/
	//FL
	if(Physics.Raycast(wheelFL.transform.position, -wheelFL.transform.up, hit, wheelFL.radius+wheelFL.suspensionDistance)){
		wheelPos = hit.point+wheelFL.transform.up * wheelFL.radius;
	}
	else{
		wheelPos = wheelFL.transform.position -wheelFL.transform.up * wheelFL.suspensionDistance;
	}
	wheelFLTrans.position = wheelPos;
	
	//FR
	if(Physics.Raycast(wheelFR.transform.position, -wheelFR.transform.up, hit, wheelFR.radius+wheelFR.suspensionDistance)){
		wheelPos = hit.point+wheelFR.transform.up * wheelFR.radius;
	}
	else{
		wheelPos = wheelFR.transform.position -wheelFR.transform.up * wheelFR.suspensionDistance;
	}
	wheelFRTrans.position = wheelPos;
	
	//RL
	if(Physics.Raycast(wheelRL.transform.position, -wheelRL.transform.up, hit, wheelRL.radius+wheelRL.suspensionDistance)){
		wheelPos = hit.point+wheelRL.transform.up * wheelRL.radius;
	}
	else{
		wheelPos = wheelRL.transform.position -wheelRL.transform.up * wheelRL.suspensionDistance;
	}
	wheelRLTrans.position = wheelPos;
	
	//RR
	if(Physics.Raycast(wheelRR.transform.position, -wheelRR.transform.up, hit, wheelRR.radius+wheelRR.suspensionDistance)){
		wheelPos = hit.point+wheelRR.transform.up * wheelRR.radius;
	}
	else{
		wheelPos = wheelRR.transform.position -wheelRR.transform.up * wheelRR.suspensionDistance;
	}
	wheelRRTrans.position = wheelPos;
}

/*Emergency brake*/
function HandBrake(){

	//If the user is holding space
	if(Input.GetButton("Jump"))// || Input.GetButton("JumpRaceWheel")){
	{
		braked = true;
	}
	else{
		braked = false;
	}
	if(braked == true){
		if(currentSpeed > 1)
		{
			wheelFR.brakeTorque = maxBrakeTorque;
			wheelFL.brakeTorque = maxBrakeTorque;
			wheelRR.motorTorque = 0;
			wheelRL.motorTorque = 0;
			
			//SetSlip(slipForwardFriction, slipSidewayFriction); (not using it)
			SetRearSlip(slipForwardFriction, slipSidewayFriction); //(Deactivated because car was sliding too much)
		}
		else if(currentSpeed < 0)
		{
			wheelFR.brakeTorque = maxBrakeTorque;
			wheelFL.brakeTorque = maxBrakeTorque;
			wheelRR.motorTorque = 0;
			wheelRL.motorTorque = 0;	
			SetRearSlip(1,1);
		}
		else
		{
			//SetSlip(myForwardFriction, mySidewayFriction); (Not using it)
			SetRearSlip(1,1);
		}
		
		//In case the user use the E-Brake (Light up the brake)
		brakeLightObject.SetActive(true);

	}
	else{
		wheelFR.brakeTorque = 0;
		wheelFL.brakeTorque = 0;
		SetRearSlip(myForwardFriction, mySidewayFriction); //(Testing since I'm sliding too much)
	}
}

function ReverseSlip()
{
	if(currentSpeed < 0)
	{
		SetFrontSlip(slipForwardFriction, slipSidewayFriction);
	}
	else
	{
		SetFrontSlip(myForwardFriction, mySidewayFriction);
	}
}

/*Used for sliding when using E-Brake*/
function SetRearSlip(currentForwardFriction : float, currentSidewayFriction : float){

	wheelRR.forwardFriction.stiffness = currentForwardFriction;
	wheelRL.forwardFriction.stiffness = currentForwardFriction;
	wheelRR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelRL.sidewaysFriction.stiffness = currentSidewayFriction;
}

function SetFrontSlip(currentForwardFriction : float, currentSidewayFriction : float){

	wheelFR.forwardFriction.stiffness = currentForwardFriction;
	wheelFL.forwardFriction.stiffness = currentForwardFriction;
	wheelFR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelFL.sidewaysFriction.stiffness = currentSidewayFriction;
}

function EngineSound(){

	//For shifting gear sounds
	for(var i=0; i < gearRatio.length; ++i)
	{	//Everytime I shift gear it will give the illusion of changing gears (with sound effects)
		if(gearRatio[i] > currentSpeed)
		{
			break;
		}
	}
	var gearMinValue : float = 0.00;
	var gearMaxValue : float = 0.00;
	
	if(i == 0)
	{
		gearMinValue = 0;
		gearMaxValue = gearRatio[i];
	}
	else//Set the max value to the current gear, min value to the last gear value
	{
		gearMinValue = gearRatio[i-1];
		gearMaxValue = gearRatio[i];
	}
	var enginePitch : float = ((currentSpeed - gearMinValue)/(gearMaxValue - gearMinValue))+1;
	audio.pitch = enginePitch;
}

//This will draw the Speedometer dynamically resizing it
function OnGUI(){
	//To draw the speedometer (location x, y, Size X, Size Y)
	GUI.DrawTexture(Rect(Screen.width - 1020,Screen.height - 260,276, 284),speedOMeterDial);
	var speedFactor : float = currentSpeed/(topSpeed+30);
	var rotationAngle : float;
	//To draw the Needle
	if(currentSpeed >=0)
	{
		 rotationAngle = Mathf.Lerp(-30,210,speedFactor);
	}
	else//In case I reverse
	{
		rotationAngle =  Mathf.Lerp(-30,210,-speedFactor);
	}
	GUIUtility.RotateAroundPivot(rotationAngle, Vector2(Screen.width-880, Screen.height-105));
	GUI.DrawTexture(Rect(Screen.width - 1018,Screen.height - 255,280, 300),speedOMeterPointer);
	
}

//For spark collision
function OnCollisionEnter(other : Collision)
{
	if(other.transform != transform && other.contacts.Length != 0 && currentSpeed != 0)//Making sure you are not colliding with itself
	{
		for(var i =0; i < other.contacts.length; ++i)
		{
			Instantiate(spark,other.contacts[i].point, Quaternion.identity);
			var clone : GameObject = Instantiate(collisionSound,other.contacts[i].point, Quaternion.identity);
			clone.transform.parent = transform;
		}
	}

}