#pragma strict
var destroyAfter : float = 2;
private var timer : float;

function Start () {

}

function Update (){
	timer += Time.deltaTime;
	if(destroyAfter <= timer){
		Destroy(gameObject);
	}
}