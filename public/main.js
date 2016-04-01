angular.module('fileUpload', ['ngMaterial', 'ngFileUpload', 'ngSanitize']).controller('MyCtrl', ['Upload', '$window', '$http', function(Upload, $window, $http) {
    var vm = this;

    vm.submit = function() {
        if (vm.upload_form.file.$valid && vm.file) {
            vm.upload(vm.file);
        }
    }

    vm.getMessage = function() {
        $http({
            method: 'GET',
            url: '/hello'
        }).then(function successCallback(response) {
            console.log(response);
            console.log(response.data.string);
            vm.message = response.data.string;
        }, function errorCallback(response) {});
    };

    vm.getSystemInfo = function() {
        $http({
            method: 'GET',
            url: '/sysinfo'
        }).then(function successCallback(response) {            
            vm.sysinfo = "<div class='sys-info'><span>IP ADRESS</span>: " +response.data.interfaces[Object.keys(response.data.interfaces)[0]][0].address 
            + '<br/>' +
            "<span>HOST NAME</span>: " +response.data.hostname
            + '<br/>' +
            "<span>PLATFROM</span>: " + response.data.platform
            + '<br/>' +
            "<span>SYSTEM REALEASE</span>: " + response.data.release+"</div>";
        }, function errorCallback(response) {});
    };

    vm.upload = function(file) {
        Upload.upload({
            url: '/upload',
            data: {
                file: file,
                mode: geMode()
            }
        }).then(function(resp) {
            document.getElementById('resultImage').setAttribute("src", "data:image/jpeg;base64," + resp.data);
            // if(resp.data.error_code === 0){ 
            //     $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
            // } else {
            //     $window.alert('an error occured');
            // }
        }, function(resp) {
            console.log('Error status: ' + resp.status);
            $window.alert('Error status: ' + resp.status);
        }, function(evt) {
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };
    var geMode = function() {
        var result = [];
        if (vm.modeRotate90) {
            result.push(1);
        }
        if (vm.modeRotate180) {
            result.push(2);
        }
        if (vm.modeSephia) {
            result.push(3);
        }
        if (vm.modeGausse) {
            result.push(4);
        }
        if (vm.modeBlack) {
            result.push(5);
        }
        if (vm.modeInverse) {
            result.push(6);
        }
        return result;
    }
}]);