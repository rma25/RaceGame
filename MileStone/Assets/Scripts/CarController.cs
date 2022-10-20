using System.Collections;
using System.Collections.Generic;
using Unity.VisualScripting;
using UnityEngine;

public class CarController : MonoBehaviour
{
    public GameObject car;        

    // Start is called before the first frame update
    public void Start()
    {        
        this.car = GetComponent<GameObject>();        
        //GetComponent<Rigidbody>().centerOfMass = centerOfMass;
    }

    // Update is called once per frame
    public void Update()
    {
        
    }

    public void OnKeyboardInput(GameObject car)
    {
        
    }

}
