let _memberList = {};

module.exports = {
	addMember: function(ip) {
		if(!_memberList[ip]) {
			_memberList[ip] = {
				ip
			}
		}
	}, 
	getMemberList: function() {
		return _memberList;
	}, 
	deleteMember: function(ip) {
		if(_memberList[ip]) {
			delete _memberList[ip];
		}
	},
	isExist: function(ip) {
		return _memberList[ip] ? true : false;
	}
}
