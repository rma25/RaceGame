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
var isBraking : boolean;
var inSector : boolean;
var sensorLength : float = 5;
var frontSensorStartPoint : float = 2.50;
var frontSensorSideDist : float = 0.72;
var frontSensorAngle : float = 30;
var sidewaySensorLength : float = 5;


function Start () {
	rigidbody.centerOfMass = centerOfMass;//Make sures the car stay on the ground when driving
	GetPath();
}

function Update () {
	GetSteer();
	Move();
	BrakingEffect();
	Sensors();
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
		wheelRR.motorTorque = decelarationSpeed;
	}
	else
	{
		wheelRL.motorTorque = maxTorque;
		wheelRR.motorTorque = maxTorque;
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
	else
	{
		AIbrakeLightObject.SetActive(false);
	}
}

function Sensors()
{
	var pos : Vector3;
	var hit : RaycastHit;
	var rightAngle = Quaternion.AngleAxis(frontSensorAngle, transform.up) * transform.forward;
	var leftAngle = Quaternion.AngleAxis(-frontSensorAngle, transform.up) * transform.forward;
	
	//Front Mid Sensor
	pos = transform.position;
	pos += transform.forward*frontSensorStartPoint;
	//Check to see if there is something in front of the AI
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		Debug.DrawLine(pos,hit.point, Color.white);
	}

	
	//Front Straight Right Sensor	
	pos += transform.right*frontSensorSideDist;
	//Check to see if there is something in front of the AI
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		Debug.DrawLine(pos,hit.point, Color.white);
	}
	
		//Front Angled Right Sensor
	if(Physics.Raycast(pos, rightAngle, hit, sensorLength))
	{
		Debug.DrawLine(pos,hit.point, Color.white);
	}	
	
	//Resetting...
	pos = transform.position;
	pos += transform.forward*frontSensorStartPoint;
	//Front Straight Left Sensor
	pos -= transform.right*frontSensorSideDist; 
	//Check to see if there is something in front of the AI
	if(Physics.Raycast(pos, transform.forward, hit, sensorLength))
	{
		Debug.DrawLine(pos,hit.point, Color.white);
	}
	
	//Front Angled Left Sensor
	if(Physics.Raycast(pos, leftAngle, hit, sensorLength))
	{
		Debug.DrawLine(pos,hit.point, Color.white);
	}
	
	//Right Sideway Sensor
	if(Physics.Raycast(transform.position, transform.right, hit, sidewaySensorLength))
	{
		Debug.DrawLine(transform.position,hit.point, Color.white);
	}
	
	//Left Sideway Sensor
	if(Physics.Raycast(transform.position, -transform.right, hit, sidewaySensorLength))
	{
		Debug.DrawLine(transform.position,hit.point, Color.white);
	}
}