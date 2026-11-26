//build something similar to my "game" version, using a table to format the info.
import { useState, useEffect } from 'react'
import { evaluate } from 'mathjs'
import './InitiativeTracker.css'
import StatBlock from '../components/StatBlock'
import supabase from '../utils/supabase.jsx'

const InitiativeTracker = () => {
    const [newCreatureName, setNewCreatureName] = useState("")
    const [creatures, setCreatures] = useState([])
    const [focusedStatBlock, setFocusedStatBlock] = useState()
    const [allCreatureNames, setAllCreatureNames] = useState([])

    //import all distinct creature names
    useEffect(() => {
        supabase
            .from('creatures')
            .select('name')
            .then(({ data, error }) => {
                if (error) {
                    console.error(error)
                    return
                }
                setAllCreatureNames(data.map(creature => creature.name))
            })
    }, [])

    const filteredSuggestions = (query) => {
        return query.trim() === ''
            ? []
            : allCreatureNames
                .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
                .sort()
    }

    //import creature data
    const loadCreatureData = async (creatureName) => {
        return supabase
            .from('creatures')
            .select()
            .ilike('name', creatureName)
            .limit(1)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error(error)
                    return
                }
                return data ? data : {}
            })
    }

    const handleFocus = (index) => {
        if (creatures[index].type) {
            setFocusedStatBlock(
                <StatBlock key={creatures[index].type} name={creatures[index].type} />
            )
        }
    };

    const pickName = (name, currentCreatures) => {
        if (name == null) {
            return ""
        }
        const usedNames = new Set(currentCreatures.map((creature) => creature?.name))
        const nameIsUsed = [...usedNames].some(
            (usedName) => usedName === name || usedName?.startsWith(name + " #")
        )
        if (!nameIsUsed) {
            return name
        }
        let nextNumber = 1
        while (usedNames.has(name + " #" + nextNumber)) {
            nextNumber += 1
        }
        return name + " #" + nextNumber
    }

    const addCreature = () => {
        const requestedName = newCreatureName
        loadCreatureData(requestedName).then((data) => {
            const newCreature = {
                type: data?.name || "",
                init: Math.floor(Math.random() * 10) + 1 + abilityScoreModifier(data?.dex),
                ac: data?.ac ? (data?.ac[0]?.ac || data?.ac[0]) : "",
                hp: data?.hp?.average || "",
                notes: "",
            }
            setCreatures((current) => [
                ...current,
                {
                    ...newCreature,
                    name: pickName(data?.name, current) || requestedName,
                },
            ])
        })
    }

    const updateCreature = (targetIndex, newCreature) => {
        setCreatures((previous) =>
            previous.map((creature, index) =>
                index === targetIndex ? newCreature : creature
            )
        )
    }

    const removeCreature = (targetIndex) => {
        setCreatures((previous) =>
            previous.filter((_, index) => index !== targetIndex)
        )
    }

    const sortByInitiative = () => {
        const sorted = [...creatures].sort((a, b) => b.init - a.init)
        setCreatures(sorted)
    }

    const abilityScoreModifier = (score) => {
        if (score == null) {
            return 0
        }
        return Math.floor((score - 10) / 2)
    }

    const attemptEvaluate = (expression) => {
        try {
            return evaluate(expression) || ""
        } catch {
            return expression
        }
    }

    return (
        <div className="full-page">
            <div className="initiative-tracker">
                <div className="button-wrapper">
                    <input
                        type="text"
                        list="creature-name-suggestions"
                        placeholder="Creature Name"
                        value={newCreatureName}
                        onChange={(e) => setNewCreatureName(e.target.value)} />
                    <datalist id="creature-name-suggestions">
                        {filteredSuggestions(newCreatureName).map((item, index) => (
                            <option key={index} value={item} />
                        ))}
                    </datalist>
                    <input type="button" value="Add Creature" onClick={addCreature} />
                </div>
                <table>
                    <colgroup>
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "40%" }} />
                        <col style={{ width: "5%" }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Creature</th>
                            <th>INIT</th>
                            <th>AC</th>
                            <th>HP</th>
                            <th>Notes</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {creatures.map((creature, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            value={creature?.name}
                                            onChange={(event) => updateCreature(index, { ...creature, name: event.target.value })}
                                            onFocus={() => handleFocus(index)}>
                                        </input>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={creature?.init}
                                            onChange={(event) => updateCreature(index, { ...creature, init: event.target.value })}
                                            onBlur={(event) => updateCreature(index, { ...creature, init: attemptEvaluate(event.target.value) })}>
                                        </input>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={creature?.ac}
                                            onChange={(event) => updateCreature(index, { ...creature, ac: event.target.value })}
                                            onBlur={(event) => updateCreature(index, { ...creature, ac: attemptEvaluate(event.target.value) })}>
                                        </input>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={creature?.hp}
                                            onChange={(event) => updateCreature(index, { ...creature, hp: event.target.value })}
                                            onBlur={(event) => updateCreature(index, { ...creature, hp: attemptEvaluate(event.target.value) })}>
                                        </input>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={creature?.notes}
                                            onChange={(event) => updateCreature(index, { ...creature, notes: event.target.value })}>
                                        </input>
                                    </td>
                                    <td>
                                        <input
                                            type="button"
                                            value="X"
                                            onClick={() => removeCreature(index)}>
                                        </input>
                                    </td>
                                </tr>)
                        })}
                    </tbody>
                </table>
                <div className="button-wrapper">
                    <input type="button" value="Sort by INIT" onClick={sortByInitiative}></input>
                </div>
            </div>
            <div className="stat-block-display">
                {focusedStatBlock != null ? focusedStatBlock : ""}
            </div>
        </div>
    )
}

export default InitiativeTracker