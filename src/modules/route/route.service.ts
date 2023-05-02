import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from 'src/schemas/locations';
import { ActiveTime, OpeningHours } from 'src/utils';

@Injectable()
export class RouteService {
  private locations: Location[] = [];
  constructor(@InjectModel(Location.name) private readonly locationRepo: Model<LocationDocument>) {
    this.init();
  }

  private async init() {
    this.locations = await this.getLocations();
  }

  changeTime(time: string, text: string) {
    const times = time.split(':');

    const hour = Number(times[0]);
    const minute = Number(times[1]);

    const value = text === 'AM' ? hour * 60 + minute : (hour + 12) * 60 + minute;
    return value;
  }

  async handleTime(locations: any) {
    const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const promises = locations.map((location: { _id: string; weekday_text: string[] }) => {
      const opening_hours = [];
      const item = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
      if (location.weekday_text) {
        location.weekday_text.map((text, index) => {
          let openTime = '';
          let closeTime = '';
          let text1 = '';
          let text2 = '';
          const listOpenTimes = [];
          const listTexts = text.split(': ');
          const times = listTexts[1];
          if (times === 'Open 24 hours') {
            openTime = '00:00';
            closeTime = '11:59';
            text1 = 'AM';
            text2 = 'PM';
            listOpenTimes.push({
              openTime: this.changeTime(openTime, text1),
              closeTime: this.changeTime(closeTime, text2),
            } as ActiveTime);
          } else {
            const listTimes = times.split(', ');
            listTimes.map((time: string) => {
              const times = time.split(/(\s+)/).filter((e) => e.trim().length > 0);
              openTime = times[0];
              text1 = ['AM', 'PM'].includes(times[1]) ? times[1] : times[-1];
              closeTime = times[times.length - 2];
              text2 = times[times.length - 1];
              listOpenTimes.push({
                openTime: this.changeTime(openTime, text1),
                closeTime: this.changeTime(closeTime, text2),
              } as ActiveTime);
            });
            if (listOpenTimes.length > 1) console.log(location._id);
          }
          item[day[index]] = listOpenTimes;
        });
      } else {
        const listOpenTimes = [];
        listOpenTimes.push({
          openTime: this.changeTime('8:00', 'AM'),
          closeTime: this.changeTime('10:30', 'PM'),
        } as ActiveTime);
        item.monday = listOpenTimes;
        item.tuesday = listOpenTimes;
        item.wednesday = listOpenTimes;
        item.thursday = listOpenTimes;
        item.friday = listOpenTimes;
        item.saturday = listOpenTimes;
        item.sunday = listOpenTimes;
      }
      return this.locationRepo
        .updateMany({ _id: location._id }, { opening_hours: item as OpeningHours }, { new: true })
        .lean();
    });

    const update = await Promise.all(promises);
  }

  async getLocations() {
    const locations = await this.locationRepo.find({}).lean();
    this.handleTime(locations);
    return locations;
  }
}
