let _memberList = {};

module.exports = {
	addMember: function(name, ip) {
		if(!_memberList[ip]) {
			_memberList[ip] = {
				name: name || ip, 
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
