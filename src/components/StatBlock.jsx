import { Fragment, useEffect, useState } from 'react'
import './StatBlock.css'
import supabase from '../utils/supabase.jsx'

const size = {
    "T": "Tiny",
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "H": "Huge",
    "G": "Gargantuan"
}

const alignment = {
    "L": "lawful",
    "N": "neutral",
    "C": "chaotic",
    "G": "good",
    "E": "evil",
    "U": "unaligned",
    "A": "any alignment"
}

const xp = {
    "0": "10",
    "1/8": "25",
    "1/4": "50",
    "1/2": "100",
    "1": "200",
    "2": "450",
    "3": "700",
    "4": "1100",
    "5": "1800",
    "6": "2300",
    "7": "2900",
    "8": "3900",
    "9": "5000",
    "10": "5900",
    "11": "7200",
    "12": "8400",
    "13": "10,000",
    "14": "11,500",
    "15": "13,000",
    "16": "15,000",
    "17": "18,000",
    "18": "20,000",
    "19": "22,000",
    "20": "25,000",
    "21": "33,000",
    "22": "41,000",
    "23": "50,000",
    "24": "62,000",
    "25": "75,000",
    "26": "90,000",
    "27": "105,000",
    "28": "120,000",
    "29": "135,000",
    "30": "150,000"
}

const abilityScoreModifiers = (score) => {
    let modifier = Math.floor((score - 10) / 2)
    return modifier > 0 ? `+${modifier}` : `${modifier}`
}

function formatList(items, { type = 'conjunction', style = 'long', locale = 'en-US' } = {}) {
    const formatter = new Intl.ListFormat(locale, { type, style });
    return formatter.format(items);
}

const spellLevelEnd = {
    1: "st",
    2: "nd",
    3: "rd",
}

const parseSpells = (key, spells) => {
    if (typeof spells === "object" && key == 0) {
        return (
            <li key={key}><p>Cantrips (at will): <i>{parseTextEntries(spells?.spells).join(", ")}</i></p></li>
        )
    } else if (typeof spells === "object") {
        return (
            <li key={key}>
                <p>{key + (spellLevelEnd[key] || "th") + " level (" + spells?.slots + " slot" + (spells?.slots > 1 ? "s" : "") + "): "}<i>{parseTextEntries(spells?.spells).join(", ")}</i></p>
            </li>
        )
    }
    console.log("unparsed spells")
    console.log(key, spells)
}

const parseAtWillSpells = (spells) => {
    return (
        <li><p>At will: <i>{parseTextEntries(spells).join(", ")}</i></p></li>
    )
    console.log("unparsed spells")
    console.log(key, spells)
}

const parseSpellcasting = (spellcasting) => {
    return spellcasting?.map((spellcastingObject, index) => {
        return (
            <div key={index}>
                <p>
                    <strong>
                        <em>{spellcastingObject?.name}. </em>
                    </strong>{parseEntries(spellcastingObject?.headerEntries)}
                </p>
                <ul>{spellcastingObject?.will ? parseAtWillSpells(spellcastingObject?.will) : ""}</ul>
                <ul>{spellcastingObject?.spells ? Object.entries(spellcastingObject?.spells)?.map(([key, value]) => parseSpells(key, value)) : ""}</ul>
                <p>{parseEntries(spellcastingObject?.footerEntries)}</p>
            </div>
        )
    })
}

const parseTextEntry = (entry) => {
    // pull out the special commands
    var new_entry = entry.replaceAll(/\{@(.*?)\}/g, (match, content) => {
        const parts = content.split(' ')
        const command = parts[0]
        const args = parts.slice(1)

        // ATK command
        if (command === 'atk') {
            if (args[0] === 'mw') {
                return `Melee Weapon Attack: ${args.slice(1).join(' ')}`
            } else if (args[0] === 'rw') {
                return `Ranged Weapon Attack: ${args.slice(1).join(' ')}`
            } else if (args[0] === 'mw,rw') {
                return `Melee or Ranged Weapon Attack: ${args.slice(1).join(' ')}`
            } else if (args[0] === 'ms') {
                return `Melee Spell Attack: ${args.slice(1).join(' ')}`
            } else if (args[0] === 'rs') {
                return `Ranged Spell Attack: ${args.slice(1).join(' ')}`
            } else if (args[0] === 'ms,rs') {
                return `Melee or Ranged Spell Attack: ${args.slice(1).join(' ')}`
            }
        }

        // DAMAGE command
        if (command === 'damage') {
            return args.join(' ')
        }

        // STATUS command
        if (command === 'status') {
            return args.join(' ').split('||').at(-1)
        }

        // CREATURE command
        if (command === 'creature') {
            return args.join(' ')
        }

        // ITEM command
        if (command === 'item') {
            return args.join(' ').split('|').at(0)
        }

        // ACTION command
        if (command === 'action') {
            return args.join(' ')
        }

        // HIT command
        if (command === 'hit') {
            return "+" + args.join(' ')
        }

        // H command
        if (command === 'h') {
            return "Hit: " + args.join(' ')
        }

        // RECHARGE command
        if (command === 'recharge') {
            let result = "(Recharge "
            if (args[0] != '6') {
                result += String(args[0]) + "-"
            }
            result += "6)"
            return result
        }

        // QUICKREF command
        if (command === 'quickref') {
            return args.join(' ').split('||').at(-1)
        }

        // CONDITION command
        if (command === 'condition') {
            return args.join(' ')
        }

        // DC command
        if (command === 'dc') {
            return "DC " + args[0]
        }

        // HOM command
        if (command === "hom") {
            return "Hit or Miss: "
        }

        // SPELL command
        if (command === "spell") {
            return args.join(' ')
        }

        // DICE command
        if (command === "dice") {
            return args.join(' ')
        }

        // SKILL command
        if (command === "skill") {
            return args.join(' ')
        }

        // SENSE command
        if (command === "sense") {
            return args.join(' ')
        }

        // ELSE
        return match
    })
    return new_entry
}

const parseTextEntries = (entries) => {
    return entries.map((entry) => parseTextEntry(entry))
}

const parseParagraphEntry = (entry) => {
    return (
        <span>{parseTextEntry(entry)}</span>
    )
}

const parseOrderedList = (orderedList) => {
    return (
        <ol style={{ marginTop: "10px" }}>
            {orderedList.map((item, index) => (
                <li key={item?.name ?? index} style={{ margin: "0 0 10px" }}>
                    <span>
                        {item?.name ? <>{item.name.split(". ").at(-1)}.{' '}</> : null}
                        {item.entry != null ? parseTextEntry(item.entry) : parseTextEntries(item.entries)}
                    </span>
                </li>
            ))}
        </ol>
    )
}

const parseObjectEntry = (entry) => {
    if (entry?.type === 'list') {
        return parseOrderedList(entry.items)
    } else if (entry?.entries != null) {
        return parseEntries(entry.entries)
    }
}

const parseEntry = (entry) => {
    if (typeof entry === 'string') {
        return parseParagraphEntry(entry)
    } else if (typeof entry === 'object') {
        return parseObjectEntry(entry)
    } else if (typeof entry === 'list') {
        return parseEntries(entry.entries)
    }
    // catches entries that don't match expected parse style
    console.log("unparsed entry")
    console.log(entry)
}

const parseEntries = (entries) => {
    if (!Array.isArray(entries)) {
        return null
    }

    return entries.map((entry, index) => (
        <Fragment key={index}>
            {parseEntry(entry)} { }
        </Fragment>
    ))
}

const parseAC = (ac) => {
    if (!ac) {
        return null
    }
    ac = ac[0]
    if (typeof ac === 'object') {
        return ac?.ac + (ac?.from ? ` (${parseTextEntries(ac.from).join(', ')})` : '')
    }
    return ac
}

const StatBlock = ({ name }) => {
    const [loaded, setLoaded] = useState(false)
    const [creatureName, setCreatureName] = useState(name)
    const [creatureData, setCreatureData] = useState(null)

    const fetchCreature = async (creatureName) => {
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
                return data
            })
    }

    useEffect(() => {
        fetchCreature(creatureName).then((data) => {
            if (!data) {
                return fetchCreature('%' + creatureName + '%')
            }
            return data
        }).then((data) => {
            setCreatureData(data)
            setLoaded(true)
        })
    }, [creatureName])

    let creatureSize = size[creatureData?.size] || ''
    let creatureType = creatureData?.type?.type || creatureData?.type

    let tagsList = creatureData?.type?.tags?.length > 0
        ? ` (${creatureData.type.tags.join(', ')})`
        : ''

    let alignmentString = creatureData?.alignment?.map((a) => alignment[a]).join(' ')
    let savingThrowsString = Object.entries(creatureData?.save || {}).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)} ${v}`).join(', ')
    let skillsString = Object.entries(creatureData?.skill || {}).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)} ${v}`).join(', ')

    let immuneString = creatureData?.immune?.map((entry) => {
        if (typeof entry === "string") {
            return parseTextEntry(entry)
        } else if (typeof entry === "object") {
            return formatList(entry?.immune) + " " + entry?.note
        }
    }).join(", ")
    let resistString = creatureData?.resist?.map((entry) => {
        if (typeof entry === "string") {
            return parseTextEntry(entry)
        } else if (typeof entry === "object") {
            return formatList(entry?.resist) + " " + entry?.note
        }
    }).join(", ")
    let vulnerableString = creatureData?.vulnerable?.map((entry) => {
        if (typeof entry === "string") {
            return parseTextEntry(entry)
        } else if (typeof entry === "object") {
            return formatList(entry?.vulnerable) + " " + entry?.note
        }
    }).join(", ")

    const formatSpeedString = ([k, v]) => {
        if (k === "canHover") {
            return null
        }
        if (k === "walk") {
            return v + " ft."
        }
        if (typeof v === 'object') {
            return k + " " + v?.number + " ft. " + v?.condition
        }
        return k + " " + v + " ft."
    }
    let speedString = Object.entries(creatureData?.speed || {})
        .map(([k, v]) => formatSpeedString([k, v]))
        .filter((i) => (i != null))
        .join(', ')

    let challengeRating = creatureData?.cr?.cr || creatureData?.cr

    let defaultLegendaryHeaderString = "The "
        + (creatureData?.name?.toLowerCase() || "creature")
        + " can take "
        + (creatureData?.legendaryActions || 3)
        + " legendary actions, choosing from the options below. Only one legendary action option can be used at a time, and only at the end of another creature’s turn. The "
        + (creatureData?.name?.toLowerCase() || "creature")
        + " regains spent legendary actions at the start of its turn."
    let legendaryHeaderString = creatureData?.legendaryHeader || defaultLegendaryHeaderString

    return (
        <div>
            {loaded ? (
                <div className="stat-block">
                    <hr className="orange-border" />
                    <div className="section-left">
                        <div className="creature-heading">
                            <h1>{creatureData?.name}</h1>
                            <h2>{creatureSize} {creatureType}{tagsList}, {alignmentString}</h2>
                        </div>
                        <svg height="5" width="100%" className="tapered-rule top-gap bottom-gap">
                            <polyline points="0,0 400,2.5 0,5"></polyline>
                        </svg>
                        <div className="top-stats">
                            <div className="property-line">
                                <h4>Armor Class </h4>
                                <p>{parseAC(creatureData?.ac)}</p>
                            </div>
                            <div className="property-line">
                                <h4>Hit Points </h4>
                                <p>{creatureData?.hp?.average} ({creatureData?.hp?.formula})</p>
                            </div>
                            <div className="property-line">
                                <h4>Speed </h4>
                                <p>{speedString}</p>
                            </div>
                            <svg height="5" width="100%" className="tapered-rule top-gap">
                                <polyline points="0,0 400,2.5 0,5"></polyline>
                            </svg>
                            <div className="abilities">
                                <div className="ability-strength">
                                    <h4>STR</h4>
                                    <p>{creatureData.str} ({abilityScoreModifiers(creatureData.str)})</p>
                                </div>
                                <div className="ability-dexterity">
                                    <h4>DEX</h4>
                                    <p>{creatureData.dex} ({abilityScoreModifiers(creatureData.dex)})</p>
                                </div>
                                <div className="ability-constitution">
                                    <h4>CON</h4>
                                    <p>{creatureData.con} ({abilityScoreModifiers(creatureData.con)})</p>
                                </div>
                                <div className="ability-intelligence">
                                    <h4>INT</h4>
                                    <p>{creatureData.int} ({abilityScoreModifiers(creatureData.int)})</p>
                                </div>
                                <div className="ability-wisdom">
                                    <h4>WIS</h4>
                                    <p>{creatureData.wis} ({abilityScoreModifiers(creatureData.wis)})</p>
                                </div>
                                <div className="ability-charisma">
                                    <h4>CHA</h4>
                                    <p>{creatureData.cha} ({abilityScoreModifiers(creatureData.cha)})</p>
                                </div>
                            </div>
                            <svg height="5" width="100%" className="tapered-rule bottom-gap">
                                <polyline points="0,0 400,2.5 0,5"></polyline>
                            </svg>
                            {creatureData?.immune && creatureData?.immune?.length > 0 ? (
                                <div className="property-line">
                                    <h4>Damage Immunities </h4>
                                    <p>{immuneString}</p>
                                </div>) : ""
                            }
                            {creatureData?.resist && creatureData?.resist?.length > 0 ? (
                                <div className="property-line">
                                    <h4>Damage Resistances </h4>
                                    <p>{resistString}</p>
                                </div>) : ""
                            }
                            {creatureData?.vulnerable && creatureData?.vulnerable?.length > 0 ? (
                                <div className="property-line">
                                    <h4>Damage Vulnerabilities </h4>
                                    <p>{vulnerableString}</p>
                                </div>) : ""
                            }
                            {creatureData?.conditionImmune && creatureData?.conditionImmune?.length > 0 ? (
                                <div className="property-line">
                                    <h4>Condition Immunities </h4>
                                    <p>{creatureData?.conditionImmune.join(', ')}</p>
                                </div>) : ""
                            }
                            {creatureData?.senses && creatureData?.senses?.length > 0 ? (
                                <div className="property-line">
                                    <h4>Senses </h4>
                                    <p>{creatureData?.senses.join(', ')}</p>
                                </div>) : ""
                            }
                            {creatureData?.save && Object.keys(creatureData?.save).length > 0 ? (
                                <div className="property-line">
                                    <h4>Saving Throws </h4>
                                    <p>{savingThrowsString}</p>
                                </div>) : ""
                            }
                            {creatureData?.skill && Object.keys(creatureData?.skill).length > 0 ? (
                                <div className="property-line">
                                    <h4>Skills </h4>
                                    <p>{skillsString}</p>
                                </div>) : ""
                            }
                            <div className="property-line">
                                <h4>Languages </h4>
                                <p>{creatureData.languages != null ? creatureData?.languages?.join(', ') : "--"}</p>
                            </div>
                            <div className="property-line">
                                <h4>Challenge </h4>
                                <p>{challengeRating} ({xp[challengeRating]} XP)</p>
                            </div>

                        </div>
                        <svg height="5" width="100%" className="tapered-rule top-gap bottom-gap">
                            <polyline points="0,0 400,2.5 0,5"></polyline>
                        </svg>
                        {creatureData?.trait?.map((trait, index) => (
                            <span key={index} style={{ margin: '0 0 10px' }}>
                                <strong>
                                    <em>{parseTextEntry(trait.name)}. </em>
                                </strong>{parseEntries(trait.entries)}<p />
                            </span>
                        ))}
                        {creatureData?.spellcasting != null ? parseSpellcasting(creatureData?.spellcasting) : ""}
                        <h3 id="actions">Actions</h3>
                        {creatureData?.action?.map((action, index) => (
                            <span key={index} style={{ margin: '0 0 10px' }}>
                                <strong>
                                    <em>{parseTextEntry(action.name)}. </em>
                                </strong>{parseEntries(action.entries)}<p />
                            </span>
                        ))}
                        {creatureData?.bonus && Object.keys(creatureData?.bonus).length > 0 ?
                            (<h3 id="actions">Bonus Actions</h3>) : ""
                        }
                        {creatureData?.bonus && Object.keys(creatureData?.bonus).length > 0 ?
                            creatureData?.bonus.map((bonus, index) => (
                                <span key={index} style={{ margin: '0 0 10px' }}>
                                    <strong>
                                        <em>{parseTextEntry(bonus.name)}. </em>
                                    </strong>{parseEntries(bonus.entries)}<p />
                                </span>
                            )) : ""
                        }
                        {creatureData?.reaction && Object.keys(creatureData?.reaction).length > 0 ?
                            (<h3 id="actions">Reactions</h3>) : ""
                        }
                        {creatureData?.reaction && Object.keys(creatureData?.reaction).length > 0 ?
                            creatureData?.reaction.map((reaction, index) => (
                                <span key={index} style={{ margin: '0 0 10px' }}>
                                    <strong>
                                        <em>{parseTextEntry(reaction.name)}. </em>
                                    </strong>{parseEntries(reaction.entries)}<p />
                                </span>
                            )) : ""
                        }
                        {creatureData?.legendary && Object.keys(creatureData?.legendary).length > 0 ?
                            (<div>
                                <h3 id="actions">Legendary Actions</h3>
                                <p>{legendaryHeaderString}</p>
                            </div>) : ""
                        }
                        {creatureData?.legendary && Object.keys(creatureData?.legendary).length > 0 ?
                            creatureData?.legendary.map((legendary, index) => (
                                <span key={index} style={{ margin: '0 0 10px' }}>
                                    <strong>
                                        <em>{parseTextEntry(legendary.name)}. </em>
                                    </strong>{parseEntries(legendary.entries)}<p />
                                </span>
                            )) : ""
                        }
                        <hr className="orange-border bottom" />
                    </div>
                </div>
            ) : (
                <p></p>
            )}
        </div>
    )
}

export default StatBlock