import React, { useState } from 'react'
import useWebSocket from 'react-use-websocket';
import {EventTypes, eventTypes} from "./types"
import {BigNumber, BigNumberish} from "@ethersproject/bignumber"

import Form from "react-bootstrap/Form"
import { Button, Container } from 'react-bootstrap';

const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;

function App() {
  const {
    sendJsonMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
    onMessage: (msg: MessageEvent<string>) => {
      setMessages([...messages, msg.data])
    },
    onError: (msg) => console.log(msg)
  });
  const [address, setAddress] = useState<string>('')
  const [abi, setAbi] = useState<string>('')
  const [type, setType] = useState<EventTypes>(eventTypes[0] as EventTypes)
  const [triggerValue, setTriggerValue] = useState<BigNumberish>()
  const [messages, setMessages] = useState<string[]>([])

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if(readyState === 1) {
      const payload = {
        type: "subscribe",
        channel: {
          label: 'Demo',
          triggerValue:triggerValue,
          type,
          address,
          abi: JSON.parse(abi)
        }
      }
      console.log(payload)
      await sendJsonMessage(payload)
    } else {
      console.log('not connected to socket yet')
    }
  }

  const onChange = (k: string, v: string | EventTypes) => {
    switch(k) {
      case 'address':
        setAddress(v)
        break;
      case 'abi':
        setAbi(v)
        break;
      case 'triggerValue':
        setTriggerValue(v)
        break;
      case 'type':
          if(eventTypes.includes(v)) setType(v as EventTypes)
        break;
      default:
        console.log('invalid state')
        break;
    }
  }

  return (
    <Container>
      <Container>
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="address">
          <Form.Label>Contract Address</Form.Label>
          <Form.Control type="string" placeholder="Enter Address" onChange={(e) => onChange('address', e.target.value)}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>ABI</Form.Label>
          <Form.Control type="string" placeholder="Enter ABI" onChange={(e) => onChange('abi', e.target.value)}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Event Type</Form.Label>
          <Form.Control as="select"  onChange={(e) => onChange('type', e.target.value)}>
            {eventTypes && eventTypes.map((v, i)=> <option key={i}>{v}</option>)}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Trigger Value</Form.Label>
          <Form.Control type="string" placeholder="Enter Trigger Value"  onChange={(e) => onChange('triggerValue', e.target.value)}/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Listen for Events
        </Button>
      </Form>
    </Container>
    <Container className="mt-3">
      <h2> Events </h2>
      {messages && messages.map((msg, i) => <ul key={i}>{msg}</ul>)}
    </Container>
    </Container>
    
  )
}

export default App
