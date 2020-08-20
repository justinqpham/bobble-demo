import * as waveResampler from 'wave-resampler';

export default (context: AudioContext, buffer: AudioBuffer, to: number) => {
  if (buffer.sampleRate === to) return buffer;
  
  const converted = waveResampler.resample(buffer.getChannelData(0), buffer.sampleRate, to, {
    method: 'sinc'
  });
  const ret = context.createBuffer(1, converted.length, to);
  const retBuf = ret.getChannelData(0);
  
  for (let i = 0; i < converted.length; ++i) {
    retBuf[i] = converted[i];
  }

  return ret;
};