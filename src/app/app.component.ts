import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from 'src/app/service/script-loader.service';
const anylicense = 'eyAiZGVidWdSZXBvcnRpbmciOiAib24iLCAiaW1hZ2VSZXBvcnRDYWNoaW5nIjogZmFsc2UsICJqc0lkZW50aWZpZXIiOiBbICJqcy5hbnlsaW5lLmNvbSIsICIxMjcuMC4wLjEiLCAibG9jYWxob3N0IiwgIjE5Mi4xNjguMC4xMzEiIF0sICJsaWNlbnNlS2V5VmVyc2lvbiI6IDIsICJtYWpvclZlcnNpb24iOiAiMjAiLCAibWF4RGF5c05vdFJlcG9ydGVkIjogMCwgInBpbmdSZXBvcnRpbmciOiB0cnVlLCAicGxhdGZvcm0iOiBbICJKUyIgXSwgInNjb3BlIjogWyAiQUxMIiBdLCAic2hvd1BvcFVwQWZ0ZXJFeHBpcnkiOiBmYWxzZSwgInNob3dXYXRlcm1hcmsiOiBmYWxzZSwgInRvbGVyYW5jZURheXMiOiAwLCAidmFsaWQiOiAiMjAyMS0xMi0xMiIgfQpXZnU4M1dsM092aFFEL1ZEa29XOVFHd2IydUtHT1hUT2ZnT0I5bWdvUHFENkRpcFQrRjFVczZsU3hpaXl4czViCm5ERitVSW5HOVlWcU9kaGVNZFBxck1nR3NPTDRvRStKeTBSNzhsL3lCRG0xNDg0NEIwNWhqMXVQcUNJdjZqNFIKcmpzWEkza3NaN0tJb2xOVmFINWNMclFJenQwMXlJS20vNVpDR2UrT3M0Q3hpRDBIT2FTaU1Ec2RraU56RVJpRApJcERtN3hkdXNvSzE4OUdQbm8rckZQd0VpOVd3c25XOXUxUTU0NjVVQS82TWw3ejViWmQyR240MWRHQlFEWjBKCmZ0ajh5b1NBMjBCazhRMS9qMkZnNDQ5a216SjE1MzdrcWovY1VsOGtHRzAxQmVmYTRkd3ZaS05kbG9FY1VXbUEKWWlPTDhMSWp0cnpjS2ZUMXNOcWdSdz09Cg==';;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  selectedPreset = { value: 'meter' };
  anyline: any;
  mirrored = false;
   viewConfig = {
    outerColor: '000000',
    outerAlpha: 0.5,
    cutouts: [
      {
        cutoutConfig: {
          // style: 'rect',
          maxWidthPercent: '80%',
          alignment: 'top_half',
          ratioFromSize: {
            width: 300,
            height: 250,
          },
          width: 720,
          strokeWidth: 2,
          cornerRadius: 4,
          strokeColor: 'FFFFFFFF',
          feedbackStrokeColor: '0099FF',
        },
        scanFeedback: {
          style: 'contour_point',
          strokeColor: '0099FF',
          fillColor: '300099FF',
          strokeWidth: 2,
          cornerRadius: 4,
          animation: 'none',
        },
      },
    ],
  };


   constructor(private scriptLoader: ScriptLoaderService) {
     scriptLoader.load('anyline').then(data => {
       console.log('script loaded ', data);
       this.mountAnylineJS({value: 'meter'})
     }).catch(error => console.log(error));
   }

  ngOnInit() {
  }


  async mountAnylineJS(preset: any) {
    debugger
    try {
      this.selectedPreset = preset;
      const win: any = window;
      const anylinejs = win.anylinejs
      const root = document.getElementById('root');
      console.log(
        {config: this.viewConfig,
        preset: preset.value,
        license: anylicense,
        element: root,
        debugAnyline: true,
      // anylinePath: '../asset/libs/@anyline/anyline-js/anyline.js',
    })
      this.anyline = anylinejs.init({
        config: this.viewConfig,
        preset: preset.value,
        license: anylicense,
        element: root,
        debugAnyline: true,
      });

      this.anyline.onResult = (result: any) => {
        console.log('Result: ', result);
        alert(JSON.stringify(result.result, null, 2));
      };

      await this.appendCameraSwitcher(this.anyline);

      await this.anyline.startScanning().catch((e: any) => alert(e.message));
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
  }

   mirrorCamera() {
    if (!this.anyline) return;
    const newState = !this.mirrored;
     this.anyline.camera.mirrorStream(newState);
     this.mirrored = newState;
  }

  async appendCameraSwitcher(anyline: any) {
    if (document.getElementById('cameraSwitcher')) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {},
      audio: false,
    });

    stream.getTracks().forEach(track => {
      stream.removeTrack(track);
      track.stop();
    });

    const devices = (await navigator.mediaDevices.enumerateDevices()) || [];

    this.renderSelect({
      options: devices
        .filter(m => m.kind === 'videoinput')
        .map(camera => ({
          text: camera.label,
          value: camera.deviceId,
        }))
        .reduce((acc, camera) => [...acc, camera], [{ text: 'switch cam' }]),
      onSelect: (deviceId: any) => deviceId && anyline.camera.setCamera(deviceId),
    });
  }

   renderSelect(body:{ options: any, onSelect: any }) {
    let parent = document.getElementsByClassName('toolbar')[0];

    //Create and append select list
    const selectEl = document.createElement('select');
    selectEl.id = 'cameraSwitcher';
    parent.appendChild(selectEl);

     body.options.forEach((option: any) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.text = option.text;
      selectEl.appendChild(optionEl);
    });

    selectEl.onchange = (e: any) => body.onSelect(e.target.value);
  }

   remountAnylineJS() {
    this.anyline?.stopScanning();
     this.anyline?.dispose();
     this.mountAnylineJS(this.selectedPreset);
  }

  async  enableFlash() {
    if (!this.anyline) return;
    try {
      await this.anyline.camera.activateFlash(true);
    } catch (e) {
      alert(e.message);
    }
  }

  async  disableFlash() {
    if (!this.anyline) return;
    try {
      await this.anyline.camera.activateFlash(false);
    } catch (e) {
      alert(e.message);
    }
  }

  async  refocus() {
    if (!this.anyline) return;
    try {
      await this.anyline.camera.refocus();
    } catch (e) {
      alert(e.message);
    }
  }


}
