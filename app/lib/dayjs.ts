import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale"
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.locale('nb');

dayjs.updateLocale('nb', {
    'weekStart': 1
})

export default dayjs;