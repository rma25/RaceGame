#pragma strict

var maxBrakeTorque : float;
var minCarSpeed : float;

//Makes the AI brake when go through the Brake Sector
function OnTriggerEnter(other : Collider)
{
	Debug.Log("Entered the Trigger");
	if(other.gameObject.name == "AI")
	{
		Debug.Log("inside other");
		var controlCurrentSpeed : float = other.transform.root.GetComponent(AICarScript).currentSpeed;
		if(controlCurrentSpeed >= minCarSpeed)
		{
			other.transform.root.GetComponent(AICarScript).inSector = true;
			other.transform.root.GetComponent(AICarScript).wheelRR.brakeTorque = maxBrakeTorque;
			other.transform.root.GetComponent(AICarScript).wheelRL.brakeTorque = maxBrakeTorque;
		}
		else
		{
			other.transform.root.GetComponent(AICarScript).inSector = false;
			other.transform.root.GetComponent(AICarScript).wheelRR.brakeTorque = 0;
			other.transform.root.GetComponent(AICarScript).wheelRL.brakeTorque = 0;
		}
		other.transform.root.GetComponent(AICarScript).isBraking = true;
	}
}

//Stops braking when it's off the brake sector
function OnTriggerExit(other : Collider)
{
	Debug.Log("Exitting Trigger");
	if(other.tag === "AI")
	{
		Debug.Log("Inside if on Exitting Trigger");
		other.transform.root.GetComponent(AICarScript).inSector = false;
		other.transform.root.GetComponent(AICarScript).wheelRR.brakeTorque = 0;
		other.transform.root.GetComponent(AICarScript).wheelRL.brakeTorque = 0;
		other.transform.root.GetComponent(AICarScript).isBraking = false;
	}
}