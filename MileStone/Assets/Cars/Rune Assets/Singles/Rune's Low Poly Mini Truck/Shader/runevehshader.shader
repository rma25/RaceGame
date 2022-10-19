// Upgrade NOTE: replaced '_Object2World' with 'unity_ObjectToWorld'
// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'
// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

//Shader for low-poly vehicles. Made by ArsKvsh and TheROBONIK from Rune Studios. 
Shader "Rune Studios/Rune's Vehicle Shader" {
Properties {
_Diffuse ("Diffuse", 2D) = "white" {}
_Specular ("Specular", 2D) = "white" {}
_SpecularForce ("Specular Force", Range(0, 5)) = 0
_Gloss ("Gloss", Range(0, 2)) = 0.5
_Cubemap ("Cubemap", Cube) = "_Skybox" {}
_Reflection1Force ("Reflection 1 Force", Range(0, 1)) = 0
_Reflection2Force ("Reflection 2 Force", Range(0, 3)) = 0
_Colormap ("Colormap", 2D) = "white" {}
_CarColor ("Car Color", Color) = (1,1,1,1)
}
SubShader {
   Tags { "RenderType"="Opaque" }

Pass {
		Name "Forward"
	    Tags { "LIGHTMODE"="ForwardBase" "SHADOWSUPPORT"="true" "RenderType"="Opaque" }
        CGPROGRAM
	    #pragma vertex vert
        #pragma fragment main
		#pragma glsl
        #include "UnityCG.cginc"
        #include "AutoLight.cginc"
        float4 _LightColor0;
        float4 _Diffuse_ST;
		float4 _Colormap_ST;
        float4 _CarColor;
		float4 _Specular_ST;
        float _Gloss;
        float _SpecularForce;
	    float _Reflection1Force;
        float _Reflection2Force;
		samplerCUBE _Cubemap;
		sampler2D _Diffuse;
        sampler2D _Specular; 
        sampler2D _Colormap; 


        struct VertexInput {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float2 texcoord0 : TEXCOORD0;
        };

        struct VertexOutput {
                float4 pos : SV_POSITION;
				float3 normalDir : TEXCOORD2;
                float4 posWorld : TEXCOORD1;
				float2 uv0 : TEXCOORD0;
                LIGHTING_COORDS(3,4)
        };

        VertexOutput vert (VertexInput a) {
                VertexOutput b;
                b.uv0 = a.texcoord0;
                b.normalDir = mul(float4(a.normal,0), unity_WorldToObject).xyz;
                b.posWorld = mul(unity_ObjectToWorld, a.vertex);
                b.pos = UnityObjectToClipPos(a.vertex);
                TRANSFER_VERTEX_TO_FRAGMENT(b)
                return b;
        }

        fixed4 main(VertexOutput i) : COLOR {
			    float3 viewDirection = normalize(_WorldSpaceCameraPos.xyz - i.posWorld.xyz);
		//light
                float att = LIGHT_ATTENUATION(i);
                float3 attcol = att * _LightColor0.xyz;
		//norm
                float3 normdir =  i.normalDir;
                float2 uvmap = i.uv0;
                float4 diffmap = tex2D(_Diffuse,TRANSFORM_TEX(uvmap.rg, _Diffuse));
                clip(diffmap.a - 0.5);
				float3 lightdir = normalize(_WorldSpaceLightPos0.xyz);
                float3 halfdir = normalize(viewDirection+lightdir);
				i.normalDir = normalize(i.normalDir);
		//diff
			    float dott = dot( normdir, lightdir );
                float3 diff_light = max( 0.0, dott) * attcol + UNITY_LIGHTMODEL_AMBIENT.rgb;
		//spec and gloss
                dott = max(0.0, dott);
                float4 specmap = tex2D(_Specular,TRANSFORM_TEX(uvmap.rg, _Specular));
				float3 refldir = reflect(i.normalDir,viewDirection);
                float3 speccol = (specmap.rgb*_SpecularForce);
                float3 specamb = ((((specmap.rgb*texCUBE(_Cubemap,float4(refldir,((1.0 - (1.0-max(0,dot(normdir, viewDirection))))))).rgb)*_Reflection1Force)+(((1.0 - specmap.rgb)*texCUBE(_Cubemap,float4(refldir,((1.0 - (1.0-max(0,dot(normdir, viewDirection))))))).rgb)*_Reflection2Force))*pow(1.0-max(0,dot(normdir, viewDirection)),0.5)) * speccol;
                float3 specular = attcol * pow(max(0,dot(halfdir,normdir)),exp2(_Gloss * 10.0+1.0)) * speccol + specamb;
                float3 output = 0;
                float4 colormap = tex2D(_Colormap,TRANSFORM_TEX(uvmap.rg, _Colormap));
                output += diff_light * ((colormap.rgb*_CarColor.rgb)+(diffmap.rgb-colormap.rgb));
                output += specular;
                return fixed4(output,1);
            }
            ENDCG
        }
    }
    FallBack "Diffuse"
}
