function Encode(id) {

	var el = document.getElementById(id);
	var	str = el.innerHTML; 
	str = encodeURI(str).split("").reverse().join("");
	el.innerHTML = "%" + str.substr(0, str.length - 1);
}
Encode("container");
function Decode(id) {

	var el = document.getElementById(id);
	var str = el.innerHTML;
	str = str.substr(1, str.length) + "%";
	el.innerHTML = decodeURI(str.split("").reverse().join(""));
}
Decode("container");