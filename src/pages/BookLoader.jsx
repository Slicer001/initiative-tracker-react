import { useState, useEffect } from 'react'
import './BookLoader.css'
const books = import.meta.glob('../../res/bestiary/bestiary-*.json', { eager: true })
import supabase from '../utils/supabase.jsx'

const allowedColumns = [
    'id',
    'ac',
    'action',
    'alignment',
    'bonus',
    'cha',
    'con',
    'condition_immune',
    'cr',
    'dex',
    'environment',
    'hp',
    'immune',
    'int',
    'lair_actions',
    'languages',
    'legendary',
    'legendary_actions',
    'legendary_header',
    'name',
    'passive',
    'reaction',
    'resist',
    'save',
    'senses',
    'size',
    'skill',
    'speed',
    'spellcasting',
    'str',
    'trait',
    'type',
    'vulnerable',
    'wis'
];

const BookLoader = () => {
    const bookUrls = Object.keys(books)

    const [selected, setSelected] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [loadedCreatures, setLoadedCreatures] = useState([])

    const loadBook = (book) => {
        let creatures = book.default.monster

        let cleanPayload = creatures.map((item) =>
            Object.fromEntries(
                Object.entries(item).filter(([key]) => allowedColumns.includes(key))
            )
        );

        supabase.from('creatures').insert(cleanPayload).then(response => {
            if (!response.success) {
                console.error(response)
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.data // Converts response payload to an object
        }).then(data => {
            console.log('Success:', data)
            setLoadedCreatures((current) => [...current, data.name])
        }).catch(error => {
            console.error('Book', book)
            console.error('Error:', error)
        })
    }

    const isAllSelected = bookUrls.length > 0 && selected.length === bookUrls.length
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelected([])
        } else {
            setSelected([...bookUrls])
        }
    }

    const toggleItem = (item) => {
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        )
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        selected.forEach((item) => {
            loadBook(books[item])
        })
        setLoaded(true)
    }

    return (
        <div className='container'>
            {loaded ? (
                <div>
                    <h1>Book Loader</h1>
                    <p>The following creatures have been loaded: {loadedCreatures.join(", ")}!</p>
                </div>
            ) : (
                <div>
                    <h1>Book Loader</h1>
                    <form onSubmit={handleSubmit}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            Select All
                        </label>

                        <hr />

                        {bookUrls.map((item) => (
                            <label key={item} style={{ display: 'block' }}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(item)}
                                    onChange={() => toggleItem(item)}
                                />
                                {item.split('/').pop()}
                            </label>
                        ))}
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default BookLoader