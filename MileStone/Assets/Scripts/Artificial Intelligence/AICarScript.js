var path : Array;
var pathGroup : Transform;
var maxSteer : float = 15.0;
var wheelFL : WheelCollider;
var wheelFR : WheelCollider;
var wheelRL : WheelCollider;
var wheelRR : WheelCollider;
var currentPathObj : int;
var centerOfMass : Vector3;
var distFromPath : float = 20;
var maxTorque : float = 50;
var currentSpeed : float;
var topSpeed : float = 150;
var decelarationSpeed : float = 30;
/*for brake lights*/
var AIbrakeLightObject : GameObject;
var AIreverseLightObject : GameObject;
var inSector : boolean;
var isBraking : boolean;
var sensorLength : float = 5;
var frontSensorStartPoint : float = 2.50;
var frontSensorSideDist : float = 0.72;
var frontSensorAngle : float = 30;
var sidewaySensorLength : float = 5;
//Just to make the wheels turn
var wheelFLTrans : Transform;
var wheelFRTrans : Transform;
var wheelRLTrans : Transform;
var wheelRRTrans : Transform;
//For Engine Sound
var AIgearRatio : int[];
//For Sensor
private var flag : int = 0;
var avoidSpeed : float = 10;
//reverse if gets stuck
var reversing : boolean = false;
var reverCounter : float = 0.0;
var waitToReverse : float = 1.0;
var reverseFor : float = 1.5;
var respawnWait : float = 2; //5 seconds
var respawnCounter : float = 0.0;


function Start () {
	rigidbody.centerOfMass = centerOfMass;//Make sures the car stay on the ground when driving
	GetPath();
}

function Update () {
	if(flag == 0)
	GetSteer();
	//This will rotate the wheels
	wheelFLTrans.Rotate(wheelFL.rpm/60*360*Time.deltaTime,0,0);
	wheelFRTrans.Rotate(wheelFR.rpm/60*360*Time.deltaTime,0,0);
	wheelRLTrans.Rotate(wheelRL.rpm/60*360*Time.deltaTime,0,0);
	wheelRRTrans.Rotate(wheelRR.rpm/60*360*Time.deltaTime,0,0);	
	Move();
	Sensors();
	EngineSound();
	Respawn();
	BrakingEffect();
}

function GetPath()
{
	var path_objs : Array = pathGroup.GetComponentsInChildren(Transform);
	path = new Array();
	
	for(var path_obj : Transform in path_objs)
	{
		if(path_obj != pathGroup)
		{
			path[path.length] = path_obj;
		}
	}

}

function GetSteer()
{
	var steerVector : Vector3 = transform.InverseTransformPoint(Vector3(path[currentPathObj].position.x, transform.position.y, path[currentPathObj].position.z));
	//Determine to turn Left or Right
	var newSteer : float = maxSteer * (steerVector.x/steerVector.magnitude);
	wheelFL.steerAngle = newSteer;
	wheelFR.steerAngle = newSteer;
	
	//Distance between the rival card and the Path Obj, then move on to the next path object
	if(steerVector.magnitude <= distFromPath)
	{
		currentPathObj++;
		if(currentPathObj >= path.length) //Just to make sure it doesn't go out of bounce
		{
			currentPathObj = 0;
		}
	}
}

function Move()
{
	currentSpeed = 2*22/7*wheelRL.radius*wheelRL.rpm*60/1000;
	currentSpeed = Mathf.Round(currentSpeed);
	
	if(inSector || currentSpeed > topSpeed)
	{
		wheelRL.motorTorque = 0;
		wheelRR.motorTorque = 0;
		wheelRL.brakeTorque = decelarationSpeed;
		wheelRR.brakeTorque = decelarationSpeed;
	}
	else
	{
		if(!reversing)
		{
			wheelRL.motorTorque = maxTorque;
			wheelRR.motorTorque = maxTorque;
		}
		else
		{
			wheelRL.motorTorque = -maxTorque;
			wheelRR.motorTorque = -maxTorque;
		}
		wheelRL.brakeTorque = 0;
		wheelRR.brakeTorque = 0;
	}

}

function BrakingEffect()
{
	if(isBraking)
	{
		AIbrakeLightObject.SetActive(true);
	}
	if(reversing)
	{
		AIreverseLightObject.SetActive(true);
	}
		AIbrakeLightObject.SetActive(false);
		AIreverseLightObject.SetActive(false);

}

//The AI will sensor what is around it
function Sensors()
{
	flag = 0;
	var avoidSensitivity : float = 0; // Increasing this in the functions will make the turns more wide
	var pos : Vector3;
	var hit : RaycastHit;
	var rightAngle = Quaternion.AngleAxis(frontSensorAngle, transform.up) * transform.forward;
	var leftAngle = Quaternion.AngleAxis(-frontSensorAngle, transform.up) * transform.forward;
	
	//Front Mid Sensor
	pos = transform.position;
	pos += transform.forward*frontSensorStartPoint;
	
	//Brake if there is something in front of it
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			isBraking = true;
			wheelRL.brakeTorque = decelarationSpeed;
			wheelRR.brakeTorque = decelarationSpeed;
			Debug.DrawLine(pos,hit.point, Color.red);
		}
	}
	else if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		isBraking = false;
		if(hit.transform.tag != "Terrain")
		{
			wheelRL.brakeTorque = 0;
			wheelRR.brakeTorque = 0;
			Debug.DrawLine(pos,hit.point, Color.red);
		}
	}

	
	//Front Straight Right Sensor	
	pos += transform.right*frontSensorSideDist;
	
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity -= 1; 
			Debug.DrawLine(pos,hit.point, Color.white);
		}
	}
	else if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag ++;
			avoidSensitivity -=1;
		}
	}
	
	//Front Angled Right Sensor
	if(Physics.Raycast(pos, rightAngle, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity -= 1; 
			Debug.DrawLine(pos,hit.point, Color.white);
		}
	}	
	
	//Resetting position...
	pos = transform.position;
	pos += transform.forward*frontSensorStartPoint;
	//Front Straight Left Sensor
	pos -= transform.right*frontSensorSideDist; 
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity += 1;
			Debug.DrawLine(pos,hit.point, Color.white);
		}
	}
	else if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag ++;
			avoidSensitivity +=1;
		}
	}
	
	//Front Angled Left Sensor
	if(Physics.Raycast(pos, leftAngle, hit, sensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity += 1; 
			Debug.DrawLine(pos,hit.point, Color.white);
		}
	}
	
	//Right Sideway Sensor (If there is an object on the right side move to the left)
	if(Physics.Raycast(transform.position, transform.right, hit, sidewaySensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity-=1;
			Debug.DrawLine(transform.position,hit.point, Color.white);
		}
	}
	
	//Left Sideway Sensor (If there is an object on the left side move to the right)
	if(Physics.Raycast(transform.position, -transform.right, hit, sidewaySensorLength))
	{
		if(hit.transform.tag != "Terrain")
		{
			flag++;
			avoidSensitivity+=1;
			Debug.DrawLine(transform.position,hit.point, Color.white);
		}
	}
	
	pos = transform.position;
	pos += transform.forward * frontSensorStartPoint;
	
	//Check to see if there is something in front of the AI (Front Mid Sensor)
	if(avoidSensitivity == 0)
	{
		if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
		{
			if(hit.transform.tag != "Terrain" && hit.normal.x < 0)
			{
				avoidSensitivity =-1;
				Debug.DrawLine(pos,hit.point, Color.white);
			}
			else
			{
				avoidSensitivity = 1;
			}
		}
	}
	
	//This will take care of reversing
	Reverse(avoidSensitivity);
	
	if(flag != 0)
	{
		AvoidSteer(avoidSensitivity);
	}
}

function Reverse(avoidSens : float)
{
	if(rigidbody.velocity.magnitude < 2 && !reversing)
	{
		reverCounter += Time.deltaTime;
		if(reverCounter >= waitToReverse)
		{
			reverCounter = 0;
			reversing = true;			
		}
	}
	else if(!reversing)
	{
		reverCounter = 0;
	}
	
	if(reversing)
	{
		avoidSens *=-1;
		reverCounter += Time.deltaTime;
		if(reverCounter >= reverseFor)
		{
			reverCounter = 0;
			reversing = false;
		}
	}
}

function Respawn()
{
	if(rigidbody.velocity.magnitude < 2)
	{
		respawnCounter += Time.deltaTime;
		if(respawnCounter >= respawnWait)
		{
			if(currentPathObj == 0)
			{
				transform.position = path[path.length-1].position;
			}
			else
			{
				transform.position = path[currentPathObj-1].position;
			}
			respawnCounter = 0;
			//In case the car flips and it loses direction, this will put it back where is supposed to go
			transform.localEulerAngles.z = 0;
		}
	}
}

function AvoidSteer(sensitivity : float)
{
	wheelFL.steerAngle = avoidSpeed * sensitivity;
	wheelFR.steerAngle = avoidSpeed * sensitivity;
}

function EngineSound(){

	//For shifting gear sounds
	for(var i=0; i < AIgearRatio.length; ++i)
	{	//Everytime I shift gear it will give the illusion of changing gears (with sound effects)
		if(AIgearRatio[i] > currentSpeed)
		{
			break;
		}
	}
	var gearMinValue : float = 0.00;
	var gearMaxValue : float = 0.00;
	
	if(i == 0)
	{
		gearMinValue = 0;
		gearMaxValue = AIgearRatio[i];
	}
	else//Set the max value to the current gear, min value to the last gear value
	{
		gearMinValue = AIgearRatio[i-1];
		gearMaxValue = AIgearRatio[i];
	}
	var enginePitch : float = ((currentSpeed - gearMinValue)/(gearMaxValue - gearMinValue))+1;
	audio.pitch = enginePitch;
}