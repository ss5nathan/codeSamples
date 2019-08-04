<?php

/*
This script uses Apache Batik svg rasterizer to convert svg files to png files. This script was used for clients to view svg files on all browsers.


*/
ini_set('allow_url_fopen',1);
ini_set('allow_url_include',1);
ini_set('max_execution_time', 300);

$svg_url = $_GET['rasterize'];
$explode = explode("/",$svg_url); //make an array from the get variable 'rasterize' based an "/" in the string
$svg = end($explode); //last item in the exploded url
$explode_svg = explode(".",$svg);

$extension = substr($explode_svg[1],0,3);
$filename = $explode_svg[0];
if($extension == 'svg'){
    //we know this is now an svg, continue checking the filename part.
    //preg_match goes here

    if(preg_match('/^[_A-Za-z0-9]+$/',$filename)){
    	//filename match
    	$now = time();
    	$svg_tempname = 'temp_'.$now.'.svg';
        $png_tempname = 'temp_'.$now.'.png';
        file_put_contents($svg_tempname, fopen($_GET['rasterize'], 'r'));
        
        exec("java -jar batik-1.11/batik-rasterizer-1.11.jar ".$svg_tempname);
        $size = getimagesize($png_tempname);
    
        $fp = fopen($png_tempname, "rb");
        if ($size && $fp) {
            header("Content-type: {$size['mime']}");
            fpassthru($fp);
        }

    }else{
    	//invalid svg filename
    	exit;
    }
}