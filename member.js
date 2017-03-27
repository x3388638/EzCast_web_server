let _memberList = {};

module.exports = {
	addMember: function(name, ip) {
		if(!_memberList[ip]) {
			_memberList[ip] = {
				name, 
				ip
			}
		}
	}, 
	getMember: function(ip) {
		return _memberList[ip];
	}, 
	getMemberList: function() {
		return _memberList;
	}, 
	updateMember: function(ip, obj) {
		if(_memberList[ip]) {
			_memberList[ip] = Object.assign({}, _memberList[ip], obj);
		}
	},
	deleteMember: function(ip) {
		if(_memberList[ip]) {
			delete _memberList[ip];
		}
		return _memberList;
	},
	isExist: function(ip) {
		return _memberList[ip] ? true : false;
	}
}
