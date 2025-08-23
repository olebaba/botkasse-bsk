import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import isBetween from 'dayjs/plugin/isBetween'
import 'dayjs/locale/nb'

dayjs.extend(localizedFormat)
dayjs.extend(updateLocale)
dayjs.extend(isBetween)
dayjs.locale('nb')

dayjs.updateLocale('nb', {
    weekStart: 1,
})

export default dayjs
