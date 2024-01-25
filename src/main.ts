import { Emails } from './Emails'
import readlineSync from 'readline-sync'

async function main() {
  const _emails = new Emails()

  const filterFields: ('from' | 'subject' | 'body')[] = [
    'from',
    'subject',
    'body',
  ]
  const filterFieldIndex = readlineSync.keyInSelect(
    filterFields,
    'Which filter field?',
    { cancel: 'Cancel' },
  )

  if (filterFieldIndex === -1) {
    console.log('Canceled program')
    return
  }

  const filterField = filterFields[filterFieldIndex]
  const searchTerm = readlineSync.question('Enter your search term: ')

  await _emails.downloadEmails(filterField, searchTerm)
  const { emails } = _emails

  console.log(emails)
}

try {
  main()
} catch (err) {
  console.error(err)
}
