import type { TypedData, TypedDataParameter } from 'abitype'

import { BytesSizeMismatchError } from '../errors/abi.js'
import { InvalidAddressError } from '../errors/address.js'
import type { Hex } from '../types/misc.js'
import type { TypedDataDefinition } from '../types/typedData.js'

import { isAddress } from './address/isAddress.js'
import { size } from './data/size.js'
import { numberToHex } from './encoding/toHex.js'
import { bytesRegex, integerRegex } from './regex.js'

export function validateTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(parameters: TypedDataDefinition<typedData, primaryType>) {
  const { domain, message, primaryType, types } =
    parameters as unknown as TypedDataDefinition

  const validateData = (
    struct: readonly TypedDataParameter[],
    data: Record<string, unknown>,
  ) => {
    for (const param of struct) {
      const { name, type } = param
      const value = data[name]

      const integerMatch = type.match(integerRegex)
      if (
        integerMatch &&
        (typeof value === 'number' || typeof value === 'bigint')
      ) {
        const [_type, base, size_] = integerMatch
        // If number cannot be cast to a sized hex value, it is out of range
        // and will throw.
        numberToHex(value, {
          signed: base === 'int',
          size: parseInt(size_) / 8,
        })
      }

      if (type === 'address' && typeof value === 'string' && !isAddress(value))
        throw new InvalidAddressError({ address: value })

      const bytesMatch = type.match(bytesRegex)
      if (bytesMatch) {
        const [_type, size_] = bytesMatch
        if (size_ && size(value as Hex) !== parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: parseInt(size_),
            givenSize: size(value as Hex),
          })
      }

      const struct = types[type]
      if (struct) validateData(struct, value as Record<string, unknown>)
    }
  }

  // Validate domain types.
  if (types['EIP712Domain'] && domain)
    validateData(types['EIP712Domain'], domain)

  if (primaryType !== 'EIP712Domain') {
    // Validate message types.
    const type = types[primaryType]
    validateData(type, message)
  }
}
