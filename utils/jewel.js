'use strict'

let jewel = module.exports;


jewel.generateForOneToOne = function(){

	let r = Math.floor(Math.random() * (121 - 1 + 1)) + 1;		

	if( r<=81 && r>=1){
		return 1;
	}else if( r<=108 && r>=82 ){
		return 2;
	}else if( r<=117 && r>=109 ){
		return 3;
	}else if( r<=120 && r>=118 ){
		return 4;
	}else if( r== 121 ){
		return 5;
	}



};


jewel.generateForGroup = function(){

	let r = Math.floor(Math.random() * ( 31 - 1 + 1)) + 1;		

	if( r<=16 && r>=1){
		return 1;
	}else if( r<=24 && r>=17 ){
		return 2;
	}else if( r<=28 && r>=25 ){
		return 3;
	}else if( r==30 || r==29 ){
		return 4;
	}else if( r== 31){
		return 5;
	}

};