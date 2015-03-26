var path : Array;
var rayColor : Color = Color.white;

function OnDrawGizmos()
{
	Gizmos.color = rayColor;
	//Get all the child objects of the path
	var path_objs : Array = transform.GetComponentsInChildren(Transform);
	path = new Array();
	
	for(var path_obj : Transform in path_objs)
	{
		if(path_obj != transform)
		{
			path[path.length] = path_obj;
		}
	}
	
	for(var i : int = 0; i < path.length; i++)
	{
		var pos : Vector3 = path[i].position;
		
		if(i > 0)
		{
			var prev = path[i-1].position; //give the location of the previous obj element
			Gizmos.DrawLine(prev, pos);
			Gizmos.DrawWireSphere(pos,0.3);
		}
	}
}